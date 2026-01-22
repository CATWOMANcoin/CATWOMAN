(function(){
  const cfg = window.NYA7 || {};
  const ca = (cfg.ca || "").trim();
  const $ = (id) => document.getElementById(id);
  const fmtUSD = (n) => {
    if (!isFinite(n)) return "$—";
    const abs = Math.abs(n);
    if (abs >= 1e9) return "$" + (n/1e9).toFixed(2) + "B";
    if (abs >= 1e6) return "$" + (n/1e6).toFixed(2) + "M";
    if (abs >= 1e3) return "$" + (n/1e3).toFixed(2) + "K";
    if (abs >= 1) return "$" + n.toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
    return "$" + n.toFixed(10).replace(/0+$/,'').replace(/\.$/,'');
  };
  $("year").textContent = String(new Date().getFullYear());
  $("ca").textContent = ca && ca !== "REPLACE_WITH_CONTRACT_ADDRESS" ? ca : "REPLACE_WITH_CONTRACT_ADDRESS";
  $("copyBtn").addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText($("ca").textContent.trim());
      $("copyBtn").textContent = "Copied!"; setTimeout(()=> $("copyBtn").textContent="Copy", 1200);
    }catch{ $("copyBtn").textContent="Copy failed"; setTimeout(()=> $("copyBtn").textContent="Copy", 1200); }
  });
  async function loadDex(){
    if (!ca || ca === "REPLACE_WITH_CONTRACT_ADDRESS"){
      $("mcHint").textContent="Set CA in index.html";
      $("priceHint").textContent="Set CA in index.html";
      $("volHint").textContent="Set CA in index.html";
      return;
    }
    const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(ca)}`;
    const res = await fetch(url,{cache:"no-store"});
    if(!res.ok) throw new Error("DexScreener error");
    const data = await res.json();
    const pairs = Array.isArray(data.pairs)?data.pairs:[];
    const best = pairs.slice().sort((a,b)=> (Number(b.liquidity?.usd||0)-Number(a.liquidity?.usd||0)))[0];
    if(!best){ $("mcHint").textContent="No pairs yet"; $("priceHint").textContent="No pairs yet"; $("volHint").textContent="No pairs yet"; return; }
    $("price").textContent=fmtUSD(Number(best.priceUsd||NaN));
    $("mc").textContent=fmtUSD(Number(best.fdv||NaN));
    $("vol").textContent=fmtUSD(Number(best.volume?.h24||NaN));
    $("priceHint").textContent=(best.dexId?best.dexId+" • updated":"updated");
    $("mcHint").textContent="FDV (proxy)";
    $("volHint").textContent="24h";
  }
  loadDex().catch(()=>{ $("mcHint").textContent="Failed to load"; $("priceHint").textContent="Failed to load"; $("volHint").textContent="Failed to load"; });
})();