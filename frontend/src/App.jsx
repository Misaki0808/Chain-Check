import React, { useState, useRef, useMemo } from 'react'
import { ethers } from 'ethers'
import WalletConnect from './components/WalletConnect'
import CreateCheque from './components/CreateCheque'
import ChequeList from './components/ChequeList'
import IntermediaryPanel from './components/IntermediaryPanel'
import UserSummary from './components/UserSummary'
import { INTERMEDIARY_ADDRESS, getReadOnlyContract, getSignerContract, CONTRACT_ADDRESS } from './utils/contractConnection'
import { RPC_URL, DEMO_WALLETS } from './utils/demoAccounts'
import { enterDemo, exitDemo, setDemoActor } from './utils/walletSession'
import './App.css'

// Anlatım metnini okumak için gereken temel süre (hız çarpanı ayrıca uygulanır)
const readMs = (t) => Math.min(4200, Math.max(1300, String(t).split(/\s+/).length * 220));

function App() {
  const [account, setAccount] = useState(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const [activeTab, setActiveTab] = useState('ozet');

  // ── Otomatik tanıtım (demo turu) state ──────────────────────────
  const [demoOn, setDemoOn] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoAccount, setDemoAccount] = useState(null);
  const [demoHud, setDemoHud] = useState(null);
  const [demoExpandId, setDemoExpandId] = useState(null);
  const [demoRefresh, setDemoRefresh] = useState(0);
  const [demoHighlight, setDemoHighlight] = useState(null);
  const [demoTransferTo, setDemoTransferTo] = useState(null);
  const [demoPrefill, setDemoPrefill] = useState(null);
  const [demoActiveField, setDemoActiveField] = useState(null);
  const [demoSubmit, setDemoSubmit] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState(1.2); // tanıtım hız çarpanı (1.2x ön tanımlı)

  const runIdRef = useRef(0);
  const pausedRef = useRef(false);
  const skipRef = useRef(false);
  const speedRef = useRef(1.2);

  const effectiveAccount = demoOn ? demoAccount : account;
  const effectiveDeployed = demoOn ? true : isDeployed;

  const isIntermediary =
    effectiveAccount && INTERMEDIARY_ADDRESS &&
    effectiveAccount.toLowerCase() === INTERMEDIARY_ADDRESS.toLowerCase();

  const wallets = useMemo(
    () => DEMO_WALLETS.map((w) => ({ ...w, address: new ethers.Wallet(w.privateKey).address })),
    []
  );

  // Duraklatılabilir + atlanabilir + iptal edilebilir bekleme.
  const sleep = (ms, myId) =>
    new Promise((resolve, reject) => {
      if (runIdRef.current !== myId) { reject(new Error('ABORT')); return; }
      if (skipRef.current) { resolve(); return; } // skip aktifken bekleme anında biter
      let remaining = ms;            // tüketilecek "temel" süre (ms cinsinden)
      let last = performance.now();
      const step = 16;               // ~60fps: kısa beklemeler (yazı yazma) bile düzgün ölçeklenir
      const id = setInterval(() => {
        if (runIdRef.current !== myId) { clearInterval(id); reject(new Error('ABORT')); return; }
        if (skipRef.current) { clearInterval(id); resolve(); return; } // sonraki adım: hemen bitir
        const now = performance.now();
        const dt = now - last;
        last = now;
        if (pausedRef.current) return;                       // duraklatma: zaman durur
        remaining -= dt * (speedRef.current || 1);           // hız çarpanı CANLI uygulanır (her tick güncel okunur)
        if (remaining <= 0) { clearInterval(id); resolve(); }
      }, step);
    });

  const resetDemoVisuals = () => {
    setDemoExpandId(null);
    setDemoHighlight(null);
    setDemoTransferTo(null);
    setDemoPrefill(null);
    setDemoActiveField(null);
  };

  const exitTour = () => {
    runIdRef.current++;
    pausedRef.current = false;
    skipRef.current = false;
    exitDemo();
    setDemoOn(false);
    setDemoPaused(false);
    setDemoAccount(null);
    setDemoHud(null);
    resetDemoVisuals();
    setActiveTab('ozet');
  };

  const pauseTour = () => { pausedRef.current = true; setDemoPaused(true); };
  const resumeTour = () => { pausedRef.current = false; setDemoPaused(false); };
  const nextStep = () => { skipRef.current = true; pausedRef.current = false; setDemoPaused(false); };
  const changeSpeed = (delta) => {
    setDemoSpeed((s) => {
      const next = Math.min(4, Math.max(0.6, Math.round((s + delta) * 10) / 10));
      speedRef.current = next;
      return next;
    });
  };
  const restartTour = () => {
    runIdRef.current++;
    pausedRef.current = false;
    skipRef.current = false;
    setDemoPaused(false);
    resetDemoVisuals();
    setTimeout(() => runTour(), 250);
  };

  const runTour = async () => {
    const myId = ++runIdRef.current;
    pausedRef.current = false;
    skipRef.current = false;
    setDemoPaused(false);
    resetDemoVisuals();

    try {
      const probe = new ethers.JsonRpcProvider(RPC_URL);
      const code = await probe.getCode(CONTRACT_ADDRESS);
      if (!code || code === '0x') throw new Error('NO_CONTRACT');
    } catch (e) {
      setDemoOn(true);
      setDemoHud({
        stepNo: 0, total: 8, role: '—', label: '',
        narration: 'Hardhat node bulunamadı veya contract deploy edilmemiş. Lütfen "npx hardhat node" ve deploy scriptini çalıştırın.',
        status: 'error',
      });
      return;
    }

    setDemoOn(true);

    const node = new ethers.JsonRpcProvider(RPC_URL);
    const read = getReadOnlyContract(node);
    const signers = wallets.map((w) => new ethers.Wallet(w.privateKey, node));
    const contractFor = (i) => getSignerContract(signers[i]);

    const setActor = (i) => {
      setDemoActor(wallets[i].address, wallets[i].privateKey);
      setDemoAccount(wallets[i].address);
    };
    const hud = (stepNo, role, label, narration, status = 'running') =>
      setDemoHud({ stepNo, total: 8, role, label, narration, status });
    const beat = (ms) => sleep(ms, myId);
    const read2 = (t) => sleep(readMs(t), myId);
    const exec = async (txPromise) => { const tx = await txPromise; await tx.wait(); };

    // Bir input'a karakter karakter yazar (typewriter) — hızlandırılmış
    const typeInto = async (formAcc, field, value, perChar) => {
      setDemoActiveField(field);
      for (let i = 1; i <= value.length; i++) {
        formAcc[field] = value.slice(0, i);
        setDemoPrefill({ ...formAcc });
        await beat(perChar);
      }
      await beat(350);
    };

    // Liste tabanlı (kabul / ciro-kabul / öde) adımlar için ortak akış
    let chequeId = null;
    const listActionStep = async ({ n, actor, role, label, tab, intro, highlight, exec: doExec, result }) => {
      setActor(actor);
      setActiveTab(tab);
      setDemoExpandId(null);
      setDemoRefresh((x) => x + 1);
      hud(n, role, label, intro);
      await beat(1700);
      await read2(intro);
      setDemoExpandId(String(chequeId));
      await beat(1600);
      setDemoHighlight(highlight);
      await beat(1900);
      await doExec();
      setDemoHighlight(null);
      setDemoRefresh((x) => x + 1);
      hud(n, role, label, result, 'done');
      await read2(result);
      await beat(1400);
    };

    enterDemo(wallets[1].address, wallets[1].privateKey);

    const steps = [
      // ── Adım 1: Keşideci paneli ──────────────────────────────
      async () => {
        const t = 'Keşideci, ChainCheck panelindeki hesap özetinde. Şimdi yeni bir dijital çek oluşturacak.';
        setActor(1);
        setActiveTab('ozet');
        setDemoRefresh((x) => x + 1);
        hud(1, 'Keşideci', 'Account 1', t);
        await beat(1500);
        await read2(t);
        await beat(800);
      },

      // ── Adım 2: Çek Oluştur (typewriter) ─────────────────────
      async () => {
        setActiveTab('olustur');
        const t = 'Çek Oluştur sayfası. Form alanları sırayla dolduruluyor: lehtar adresi, tutar, vade, kimlik hash ve maskeli ad.';
        hud(2, 'Keşideci', 'Account 1', t);
        await beat(1500);
        await read2(t);

        const due = new Date(Date.now() + 120 * 86400 * 1000).toISOString().slice(0, 10);
        const form = { receiver: '', amount: '', dueDate: '', identityHash: '', maskedName: '' };
        setDemoPrefill({ ...form });
        await beat(500);
        await typeInto(form, 'receiver', wallets[2].address, 22);
        await typeInto(form, 'amount', '50000', 90);
        setDemoActiveField('dueDate');
        form.dueDate = due;
        setDemoPrefill({ ...form });
        await beat(700);
        await typeInto(form, 'identityHash', 'demo-hash-9f86d081884c7d65', 22);
        await typeInto(form, 'maskedName', 'Ahmet Y.', 70);
        setDemoActiveField(null);
        await beat(600);

        const t2 = 'Form hazır. "Çek Oluştur" butonuyla çek blok zincirine yazılıyor.';
        setDemoHighlight('create-submit');
        hud(2, 'Keşideci', 'Account 1', t2);
        await read2(t2);
        await beat(800);

        const prevCounter = Number(await read.chequeCounter());
        setDemoSubmit((x) => x + 1);
        for (let i = 0; i < 80; i++) {
          if (runIdRef.current !== myId) throw new Error('ABORT');
          const c = Number(await read.chequeCounter());
          if (c > prevCounter) { chequeId = c; break; }
          await beat(350);
        }
        if (!chequeId) throw new Error('CREATE_TIMEOUT');
        setDemoHighlight(null);
        const t3 = `Çek #${chequeId} oluşturuldu — durum: Onay Bekliyor. İşlem hash ve süresi ekranda görünüyor.`;
        hud(2, 'Keşideci', 'Account 1', t3, 'done');
        await read2(t3);
        await beat(1500);
      },

      // ── Adım 3: Düzenlediğim Çekler ──────────────────────────
      async () => {
        setActiveTab('ceklerim');
        setDemoPrefill(null);
        setDemoRefresh((x) => x + 1);
        const t = `Keşidecinin "Düzenlediğim Çekler" listesi. Az önce oluşturulan Çek #${chequeId} burada; detayı otomatik açılıyor.`;
        hud(3, 'Keşideci', 'Account 1', t);
        await beat(1500);
        await read2(t);
        setDemoExpandId(String(chequeId));
        await beat(2400);
      },

      // ── Adım 4: İlk Alıcı kabul ──────────────────────────────
      async () => {
        await listActionStep({
          n: 4, actor: 2, role: 'İlk Alıcı', label: 'Account 2', tab: 'alacaklarim',
          intro: 'Hesap değişti. İlk Alıcı "Alacaklarım" sayfasında kendisine gelen çeki görüyor ve kabul edecek.',
          highlight: 'accept',
          exec: () => exec(contractFor(2).acceptCheque(chequeId)),
          result: 'Çek kabul edildi — durum artık Aktif. Çek geçerli ve devredilebilir.',
        });
      },

      // ── Adım 5: İlk Alıcı ciro ───────────────────────────────
      async () => {
        const t = 'İlk Alıcı çeki Yeni Alıcı\'ya (Account 3) devrediyor. Ciranta adresi forma giriliyor.';
        hud(5, 'İlk Alıcı', 'Account 2', t);
        await beat(1300);
        await read2(t);
        setDemoTransferTo(wallets[3].address);
        await beat(1200);
        setDemoHighlight('transfer-submit');
        await beat(1900);
        await exec(contractFor(2).requestTransfer(chequeId, wallets[3].address));
        setDemoHighlight(null);
        setDemoTransferTo(null);
        setDemoRefresh((x) => x + 1);
        const t2 = 'Ciro talebi oluşturuldu — durum: Ciro Bekliyor. Devrin Yeni Alıcı tarafından onaylanması gerekiyor.';
        hud(5, 'İlk Alıcı', 'Account 2', t2, 'done');
        await read2(t2);
        await beat(1400);
      },

      // ── Adım 6: Yeni Alıcı ciroyu kabul ──────────────────────
      async () => {
        await listActionStep({
          n: 6, actor: 3, role: 'Yeni Alıcı', label: 'Account 3', tab: 'alacaklarim',
          intro: 'Hesap değişti. Yeni Alıcı, kendisine yapılan ciro talebini "Alacaklarım"da görüyor ve kabul edecek.',
          highlight: 'accept-transfer',
          exec: () => exec(contractFor(3).acceptTransfer(chequeId)),
          result: 'Ciro kabul edildi — çekin yeni sahibi Account 3, durum: Aktif.',
        });
      },

      // ── Adım 7: Yeni Alıcı tahsile gönder ────────────────────
      async () => {
        const t = 'Yeni Alıcı çeki tahsil etmek istiyor ve aracı kuruma gönderiyor.';
        hud(7, 'Yeni Alıcı', 'Account 3', t);
        await beat(1300);
        await read2(t);
        setDemoHighlight('request-payment');
        await beat(1900);
        await exec(contractFor(3).requestPayment(chequeId));
        setDemoHighlight(null);
        setDemoRefresh((x) => x + 1);
        const t2 = 'Tahsil talebi başlatıldı — durum: Tahsile Gönderildi. Sıra aracı kurumda.';
        hud(7, 'Yeni Alıcı', 'Account 3', t2, 'done');
        await read2(t2);
        await beat(1400);
      },

      // ── Adım 8: Aracı Kurum öder ─────────────────────────────
      async () => {
        await listActionStep({
          n: 8, actor: 0, role: 'Aracı Kurum', label: 'Account 0', tab: 'araci',
          intro: 'Hesap değişti. Aracı Kurum panelinde bekleyen tahsil talebi görünüyor; çeki ödeyecek.',
          highlight: 'mark-paid',
          exec: () => exec(contractFor(0).markAsPaid(chequeId)),
          result: 'Çek başarıyla ödendi — durum: Ödendi. ✅ Çekin yaşam döngüsü tamamlandı.',
        });
      },

      // ── Kapanış ──────────────────────────────────────────────
      async () => {
        setActor(1);
        setActiveTab('ozet');
        setDemoExpandId(null);
        setDemoRefresh((x) => x + 1);
        const t = '✅ Tüm çek yaşam döngüsü tamamlandı: oluşturma → kabul → ciro → tahsil → ödeme. Keşidecinin özetinde ödenen çek görünüyor.';
        setDemoHud({ stepNo: 8, total: 8, role: 'Keşideci', label: 'Account 1', narration: t, status: 'finished' });
      },
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        if (runIdRef.current !== myId) return;
        skipRef.current = false; // her adım başında "sonraki adım" sıfırlanır
        await steps[i]();
      }
    } catch (e) {
      if (e.message === 'ABORT') return;
      console.error('Tour error:', e);
      setDemoHud((h) => ({
        ...(h || { stepNo: 0, total: 8, role: '—', label: '' }),
        narration: 'Tanıtım sırasında bir hata oluştu. Konsolu kontrol edin.',
        status: 'error',
      }));
    }
  };

  const navDisabled = demoOn;
  const tourActive = demoOn && demoHud && demoHud.status !== 'finished' && demoHud.status !== 'error';

  const renderContent = () => {
    if (activeTab === 'ozet') {
      return (
        <section className="dashboard-section">
          <UserSummary account={effectiveAccount} isDeployed={effectiveDeployed} refreshSignal={demoRefresh} />
        </section>
      );
    }
    if (activeTab === 'ceklerim') {
      return (
        <section className="dashboard-section">
          <ChequeList account={effectiveAccount} isDeployed={effectiveDeployed} filterType="ceklerim"
            autoExpandId={demoExpandId} refreshSignal={demoRefresh} demoHighlight={demoHighlight} demoTransferTo={demoTransferTo} />
        </section>
      );
    }
    if (activeTab === 'olustur') {
      return (
        <section className="dashboard-section">
          <CreateCheque account={effectiveAccount} isDeployed={effectiveDeployed}
            demoPrefill={demoPrefill} demoSubmitSignal={demoSubmit} demoHighlight={demoHighlight} demoActiveField={demoActiveField} />
        </section>
      );
    }
    if (activeTab === 'alacaklarim') {
      return (
        <section className="dashboard-section">
          <ChequeList account={effectiveAccount} isDeployed={effectiveDeployed} filterType="alacaklarim"
            autoExpandId={demoExpandId} refreshSignal={demoRefresh} demoHighlight={demoHighlight} demoTransferTo={demoTransferTo} />
        </section>
      );
    }
    if (activeTab === 'araci') {
      return (
        <section className="dashboard-section">
          <IntermediaryPanel account={effectiveAccount} isDeployed={effectiveDeployed}
            autoExpandId={demoExpandId} refreshSignal={demoRefresh} demoHighlight={demoHighlight} />
        </section>
      );
    }
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h1>ChainCheck</h1>
          <p>Dijital Çek (Demo)</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'ozet' ? 'active' : ''}`} onClick={() => setActiveTab('ozet')} disabled={navDisabled}>Özet</button>
          <button className={`nav-item ${activeTab === 'ceklerim' ? 'active' : ''}`} onClick={() => setActiveTab('ceklerim')} disabled={navDisabled}>Çeklerim</button>
          <button className={`nav-item ${activeTab === 'olustur' ? 'active' : ''}`} onClick={() => setActiveTab('olustur')} disabled={navDisabled}>Çek Oluştur</button>
          <button className={`nav-item ${activeTab === 'alacaklarim' ? 'active' : ''}`} onClick={() => setActiveTab('alacaklarim')} disabled={navDisabled}>Alacaklarım</button>
          {isIntermediary && (
            <button className={`nav-item ${activeTab === 'araci' ? 'active' : ''}`} onClick={() => setActiveTab('araci')} disabled={navDisabled}>Aracı Kurum Paneli</button>
          )}
          <button
            className="nav-item nav-item-demo"
            onClick={() => (demoOn ? exitTour() : runTour())}
          >
            {demoOn ? '⏹ Turu Bitir' : '🎬 Otomatik Tanıtım'}
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>Sprint 1</p>
        </div>
      </aside>

      <main className="app-main-content">
        <header className="content-header">
          {demoOn ? (
            <div className="demo-actor-pill">
              <span className="demo-actor-dot" />
              Tanıtım Modu • Aktif Hesap: <strong>{demoHud ? demoHud.role : '—'}</strong>
            </div>
          ) : (
            <WalletConnect onAccountChange={setAccount} onDeployStatusChange={setIsDeployed} />
          )}
        </header>

        {demoOn && demoHud && (
          <div className={`demo-hud ${demoHud.status} ${demoPaused ? 'paused' : ''}`}>
            <div className="demo-hud-main">
              <span className="demo-hud-badge">🎬 Otomatik Tanıtım</span>
              {demoHud.stepNo > 0 && <span className="demo-hud-step">Adım {demoHud.stepNo}/{demoHud.total}</span>}
              {demoHud.role !== '—' && (
                <span className="demo-hud-actor">Hesap: <strong>{demoHud.role}</strong> · {demoHud.label}</span>
              )}
              {demoPaused && <span className="demo-hud-paused">⏸ Duraklatıldı</span>}
            </div>
            <div className="demo-hud-narration">{demoHud.narration}</div>
            <div className="demo-hud-controls">
              {tourActive && (
                <div className="demo-hud-speed" title="Tanıtım hızı">
                  <button className="demo-hud-btn speed-btn" onClick={() => changeSpeed(-0.2)} disabled={demoSpeed <= 0.6} aria-label="Yavaşlat">−</button>
                  <span className="demo-hud-speed-val">{demoSpeed.toFixed(1)}×</span>
                  <button className="demo-hud-btn speed-btn" onClick={() => changeSpeed(0.2)} disabled={demoSpeed >= 4} aria-label="Hızlandır">+</button>
                </div>
              )}
              {tourActive && !demoPaused && (
                <button className="demo-hud-btn" onClick={pauseTour}>⏸ Duraklat</button>
              )}
              {tourActive && demoPaused && (
                <button className="demo-hud-btn primary" onClick={resumeTour}>▶ Devam Et</button>
              )}
              {tourActive && (
                <button className="demo-hud-btn" onClick={nextStep}>⏭ Sonraki Adım</button>
              )}
              <button className="demo-hud-btn" onClick={restartTour}>↻ Yeniden Başlat</button>
              <button className="demo-hud-btn" onClick={exitTour}>
                {tourActive ? '■ Bitir' : 'Kapat'}
              </button>
            </div>
          </div>
        )}

        <div className="content-body">
          {effectiveAccount ? (
            renderContent()
          ) : (
            <section className="dashboard-section">
              <div className="empty-state">
                <p>Lütfen devam etmek için cüzdanınızı bağlayın.</p>
                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Cüzdanınız yoksa, sol menüden <strong>🎬 Otomatik Tanıtım</strong>'a basarak uygulamanın tüm akışını otomatik izleyebilirsiniz.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App;
