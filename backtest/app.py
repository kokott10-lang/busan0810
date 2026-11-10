"""
주식 백테스트 시뮬레이터 (초안)

- 데이터: FinanceDataReader (종목 목록이 안 되면 pykrx 로 대체)
- 엔진:   backtesting.py
- 화면:   Flask + templates/index.html

실행:
    pip install -r requirements.txt
    python app.py
    → http://localhost:5000
"""
import math
import os
import tempfile
import threading
import uuid
from datetime import date, timedelta

import pandas as pd
from flask import Flask, abort, jsonify, render_template, request, send_file

import FinanceDataReader as fdr
from backtesting import Backtest, Strategy
from backtesting.lib import crossover

app = Flask(__name__)
PLOT_DIR = os.path.join(tempfile.gettempdir(), "bt_plots")
os.makedirs(PLOT_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# 종목 목록 / 검색
# ---------------------------------------------------------------------------
_listing = None
_listing_lock = threading.Lock()


def load_listing() -> pd.DataFrame:
    """KRX 전 종목(코드, 이름, 시장). 최초 1회만 내려받아 메모리에 보관."""
    global _listing
    with _listing_lock:
        if _listing is not None:
            return _listing
        df = None
        # 1) FinanceDataReader KRX 전체  2) KOSPI+KOSDAQ 따로  3) pykrx
        for markets in (["KRX"], ["KOSPI", "KOSDAQ"]):
            try:
                parts = []
                for m in markets:
                    raw = fdr.StockListing(m)
                    part = raw[["Code", "Name"]].copy()
                    part["Market"] = raw["Market"] if "Market" in raw else m
                    parts.append(part)
                df = pd.concat(parts)
                break
            except Exception as e:  # noqa: BLE001
                app.logger.warning("FinanceDataReader 종목 목록(%s) 실패: %s", markets, e)
        if df is None or df.empty:
            from pykrx import stock

            rows = []
            for market in ("KOSPI", "KOSDAQ"):
                for code in stock.get_market_ticker_list(market=market):
                    rows.append((code, stock.get_market_ticker_name(code), market))
            df = pd.DataFrame(rows, columns=["Code", "Name", "Market"])
            if df.empty:
                raise RuntimeError("pykrx 종목 목록도 비어 있습니다")
        df["Code"] = df["Code"].astype(str).str.zfill(6)
        _listing = df.drop_duplicates("Code").reset_index(drop=True)
        return _listing


@app.get("/api/search")
def api_search():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify([])
    try:
        df = load_listing()
    except Exception as e:  # noqa: BLE001
        # 목록을 못 받아와도 6자리 종목코드는 그대로 쓸 수 있게
        if q.isdigit() and len(q) == 6:
            return jsonify([{"Code": q, "Name": q, "Market": "코드 직접 입력"}])
        return jsonify({"error": f"종목 목록을 불러오지 못했습니다. 6자리 종목코드로 입력해 보세요. ({e})"}), 502
    ql = q.lower()
    name_l = df["Name"].str.lower()
    hit = df[name_l.str.contains(ql, regex=False) | df["Code"].str.startswith(q)]
    # 정확히 일치 → 앞부분 일치 → 포함 순으로 정렬
    rank = (
        (name_l[hit.index] != ql).astype(int) * 2
        + (~name_l[hit.index].str.startswith(ql)).astype(int)
    )
    hit = hit.assign(_r=rank, _l=hit["Name"].str.len()).sort_values(["_r", "_l"])
    return jsonify(hit[["Code", "Name", "Market"]].head(20).to_dict("records"))


# ---------------------------------------------------------------------------
# 지표
# ---------------------------------------------------------------------------
def SMA(values, n):
    return pd.Series(values).rolling(n).mean()


def SMA_early(values, n):
    """초반 n일 미만 구간도 값이 나오는 이동평균 (전략이 첫날부터 동작하도록)"""
    return pd.Series(values).rolling(n, min_periods=1).mean()


def RSI(values, n=14):
    s = pd.Series(values)
    d = s.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn)


# ---------------------------------------------------------------------------
# 전략
# ---------------------------------------------------------------------------
class BuyHold(Strategy):
    """첫날 사서 끝까지 보유 (비교 기준)"""

    def init(self):
        pass

    def next(self):
        if not self.position:
            self.buy()


class SmaCross(Strategy):
    """골든크로스 매수 / 데드크로스 매도"""

    n1 = 20
    n2 = 60

    def init(self):
        self.s1 = self.I(SMA, self.data.Close, self.n1, name=f"SMA{self.n1}")
        self.s2 = self.I(SMA, self.data.Close, self.n2, name=f"SMA{self.n2}")

    def next(self):
        if crossover(self.s1, self.s2):
            self.buy()
        elif crossover(self.s2, self.s1):
            self.position.close()


class RsiReversal(Strategy):
    """RSI 과매도 탈출 시 매수, 과매수 도달 시 매도"""

    n = 14
    lower = 30
    upper = 70

    def init(self):
        self.rsi = self.I(RSI, self.data.Close, self.n, name=f"RSI{self.n}")

    def next(self):
        if not self.position and crossover(self.rsi, self.lower):
            self.buy()
        elif self.position and self.rsi[-1] >= self.upper:
            self.position.close()


class SplitExit(Strategy):
    """
    분할 익절 + 추적 손절
      - 진입: 시작일 매수, (재진입 옵션) 전량 청산 후 골든크로스 시 재매수
      - 1차 익절: 진입가 대비 +tp1% 도달 → 최초 수량의 p1% 매도
      - 2차 익절: +tp2% 도달 → 최초 수량의 p2% 매도
      - 1차 익절 이후: 보유 중 최고가 대비 -trail% 하락 → 잔량 전량 매도
      - 손절: 진입가 대비 -stop% 하락 → 전량 매도
    """

    tp1 = 20.0
    tp2 = 40.0
    p1 = 30.0
    p2 = 30.0
    trail = 10.0
    stop = 10.0
    reentry = 1
    n1 = 20
    n2 = 60

    def init(self):
        self.s1 = self.I(SMA_early, self.data.Close, self.n1, name=f"SMA{self.n1}")
        self.s2 = self.I(SMA_early, self.data.Close, self.n2, name=f"SMA{self.n2}")
        self.entered_once = False
        self._reset()

    def _reset(self):
        self.entry = None
        self.peak = 0.0
        self.stage = 0

    def next(self):
        price = self.data.Close[-1]

        if not self.position:
            if self.entry is not None:  # 직전 봉에서 전량 청산됨
                self._reset()
            if not self.entered_once or (self.reentry and crossover(self.s1, self.s2)):
                self.buy()
                self.entered_once = True
            return

        if self.entry is None:  # 매수 체결 직후 진입가 기록
            self.entry = self.trades[0].entry_price
            self.peak = self.entry
        self.peak = max(self.peak, self.data.High[-1])
        gain = price / self.entry - 1

        if gain <= -self.stop / 100:
            self.position.close()
            return
        if self.stage == 0 and gain >= self.tp1 / 100:
            self.position.close(portion=min(self.p1 / 100, 1))
            self.stage = 1
            return
        if self.stage == 1 and gain >= self.tp2 / 100:
            left = 1 - self.p1 / 100
            self.position.close(portion=min(self.p2 / 100 / left, 1) if left > 0 else 1)
            self.stage = 2
            return
        if self.stage >= 1 and price <= self.peak * (1 - self.trail / 100):
            self.position.close()


STRATEGIES = {
    "buyhold": BuyHold,
    "sma": SmaCross,
    "rsi": RsiReversal,
    "split": SplitExit,
}


# ---------------------------------------------------------------------------
# 백테스트 API
# ---------------------------------------------------------------------------
def _num(v):
    if v is None:
        return None
    if isinstance(v, (pd.Timestamp,)):
        return v.strftime("%Y-%m-%d")
    if isinstance(v, pd.Timedelta):
        return v.days
    try:
        f = float(v)
    except (TypeError, ValueError):
        return str(v)
    return None if math.isnan(f) or math.isinf(f) else f


def load_prices(code: str, start: str, end: str) -> pd.DataFrame:
    df = fdr.DataReader(code, start, end)
    df = df[["Open", "High", "Low", "Close", "Volume"]].dropna()
    df = df[(df[["Open", "High", "Low", "Close"]] > 0).all(axis=1)]  # 거래정지일 제거
    return df


@app.post("/api/backtest")
def api_backtest():
    body = request.get_json(force=True) or {}
    code = str(body.get("code", "")).strip()
    if not code:
        return jsonify({"error": "종목을 선택하세요."}), 400
    strat_key = body.get("strategy", "split")
    Strat = STRATEGIES.get(strat_key)
    if Strat is None:
        return jsonify({"error": "알 수 없는 전략입니다."}), 400

    start = body.get("start") or (date.today() - timedelta(days=365 * 3)).isoformat()
    end = body.get("end") or date.today().isoformat()
    cash = float(body.get("cash") or 10_000_000)
    commission = float(body.get("commission") or 0) / 100

    # 전략 파라미터: 클래스에 정의된 이름만 허용
    params = {}
    for k, v in (body.get("params") or {}).items():
        if hasattr(Strat, k) and not k.startswith("_"):
            params[k] = type(getattr(Strat, k))(float(v))

    try:
        df = load_prices(code, start, end)
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"시세를 불러오지 못했습니다: {e}"}), 502
    if len(df) < 30:
        return jsonify({"error": "기간 내 시세 데이터가 너무 적습니다 (30거래일 이상 필요)."}), 400
    if cash < df["Close"].iloc[0]:
        return jsonify({"error": "초기 자금이 첫날 주가보다 적어 1주도 살 수 없습니다."}), 400

    bt_kwargs = dict(cash=cash, commission=commission, exclusive_orders=False)
    try:
        bt = Backtest(df, Strat, finalize_trades=True, **bt_kwargs)
    except TypeError:  # 구버전 backtesting.py
        bt = Backtest(df, Strat, **bt_kwargs)
    try:
        stats = bt.run(**params)
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"백테스트 실행 오류: {e}"}), 500

    keys = [
        "Start", "End", "Duration", "Exposure Time [%]", "Equity Final [$]",
        "Equity Peak [$]", "Return [%]", "Buy & Hold Return [%]", "Return (Ann.) [%]",
        "Volatility (Ann.) [%]", "Sharpe Ratio", "Max. Drawdown [%]",
        "Max. Drawdown Duration", "# Trades", "Win Rate [%]", "Best Trade [%]",
        "Worst Trade [%]", "Avg. Trade [%]", "Profit Factor",
    ]
    summary = {k: _num(stats.get(k)) for k in keys if k in stats}

    eq = stats["_equity_curve"]["Equity"]
    bh = cash * df["Close"] / df["Close"].iloc[0]
    curve = {
        "dates": [d.strftime("%Y-%m-%d") for d in eq.index],
        "equity": [round(float(x)) for x in eq.values],
        "buyhold": [round(float(x)) for x in bh.reindex(eq.index).values],
        "close": [float(x) for x in df["Close"].reindex(eq.index).values],
    }

    trades = []
    for _, t in stats["_trades"].iterrows():
        trades.append({
            "size": int(t["Size"]),
            "entryTime": _num(t["EntryTime"]),
            "exitTime": _num(t["ExitTime"]),
            "entryPrice": _num(t["EntryPrice"]),
            "exitPrice": _num(t["ExitPrice"]),
            "pnl": _num(t["PnL"]),
            "returnPct": _num(t["ReturnPct"] * 100),
        })

    plot_id = None
    try:
        plot_id = uuid.uuid4().hex
        bt.plot(filename=os.path.join(PLOT_DIR, plot_id + ".html"),
                open_browser=False, resample=False)
    except Exception as e:  # noqa: BLE001
        app.logger.warning("상세 차트 생성 실패: %s", e)
        plot_id = None

    return jsonify({
        "code": code,
        "bars": len(df),
        "summary": summary,
        "curve": curve,
        "trades": trades,
        "plotUrl": f"/plot/{plot_id}" if plot_id else None,
    })


@app.get("/plot/<plot_id>")
def plot(plot_id):
    if not plot_id.isalnum():
        abort(404)
    path = os.path.join(PLOT_DIR, plot_id + ".html")
    if not os.path.exists(path):
        abort(404)
    return send_file(path)


@app.get("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=False)
