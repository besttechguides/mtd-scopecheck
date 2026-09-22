(function () {
  "use strict";

  /** @type {Record<string, { label: string, threshold: number, start: string, startISO: string, wave: string }>} */
  var WAVES = {
    "2024-25": {
      label: "2024 to 2025",
      threshold: 50000,
      start: "6 April 2026",
      startISO: "2026-04-06",
      wave: "Wave 1 (over £50,000)"
    },
    "2025-26": {
      label: "2025 to 2026",
      threshold: 30000,
      start: "6 April 2027",
      startISO: "2027-04-06",
      wave: "Wave 2 (over £30,000)"
    },
    "2026-27": {
      label: "2026 to 2027",
      threshold: 20000,
      start: "6 April 2028",
      startISO: "2028-04-06",
      wave: "Wave 3 (over £20,000)"
    }
  };

  var TODAY = new Date(2026, 8, 3); // 3 Sep 2026 (local)

  // Sage UK Impact tracking URL. Empty until a live link is issued.
  var SAGE_TRACKING_URL = "https://sageuklimited.sjv.io/5kGrQj";

  var form = document.getElementById("scope-form");
  var resultEl = document.getElementById("result");
  var printBtn = document.getElementById("print-btn");

  function parseMoney(value) {
    if (value === "" || value === null || value === undefined) return 0;
    var n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  }

  function formatGBP(n) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0
    }).format(n);
  }

  function startDateStatus(iso) {
    var parts = iso.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (d <= TODAY) {
      return {
        past: true,
        text: "That start date is already in the past — you should already be using Making Tax Digital for Income Tax (or signing up now if you have not)."
      };
    }
    return {
      past: false,
      text: "Your start date has not yet arrived. You can still prepare and may sign up voluntarily before then."
    };
  }

  function nextWaveHint(taxYear, qualifying) {
    var order = ["2024-25", "2025-26", "2026-27"];
    var idx = order.indexOf(taxYear);
    var hints = [];

    for (var i = idx + 1; i < order.length; i++) {
      var w = WAVES[order[i]];
      if (qualifying > w.threshold) {
        hints.push(
          "Based on the same figure, you would meet the " +
            w.wave +
            " threshold and would need to start from " +
            w.start +
            " if that year’s return shows qualifying income over " +
            formatGBP(w.threshold) +
            ". Re-check with the income on that year’s return."
        );
        break;
      }
    }

    if (hints.length === 0 && qualifying <= WAVES["2026-27"].threshold) {
      hints.push(
        "Your figure is at or below the lowest published threshold shown here (£20,000 for the 2026 to 2027 tax year). You are not in a listed wave on this income alone — but thresholds and rules can change, and HMRC assesses each return year separately."
      );
    }

    return hints;
  }


  function affiliateHtml(inScope) {
    if (!inScope || !SAGE_TRACKING_URL) return "";
    return (
      '<div class="affiliate no-print" role="complementary">' +
      '<p class="affiliate__kicker">Software · affiliate link disclosed</p>' +
      "<h3>Choose compatible software</h3>" +
      "<p>If you are in scope you need HMRC-recognised software for digital records and quarterly updates. HMRC does not recommend a product. Start with the official finder. One paid option we can refer:</p>" +
      "<ul>" +
      '<li><a href="https://www.gov.uk/guidance/find-software-that-works-with-making-tax-digital-for-income-tax" target="_blank" rel="noopener">Official HMRC software finder and guidance</a></li>' +
      "</ul>" +
      '<div class="affiliate__card">' +
      "<p><strong>Sage Accounting</strong> (Sage Business Cloud Accounting) is paid cloud accounting for small businesses and VAT-registered sole traders. This programme pays on that product, not on Sage&rsquo;s free Sole Trader app.</p>" +
      '<p><a class="btn-primary affiliate__btn" href="' +
      SAGE_TRACKING_URL +
      '" target="_blank" rel="sponsored nofollow noopener">See Sage Accounting</a></p>' +
      "</div>" +
      '<p class="affiliate__disc"><strong>Ad / Affiliate disclosure.</strong> This is an affiliate link. If you buy Sage Accounting through it, we may earn a commission at no extra cost to you. We only show this Sage link on in-scope results. This site is not affiliated with HMRC. Not tax advice — confirm scope and software on GOV.UK.</p>' +
      "</div>"
    );
  }

  function selectedRadio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function renderResult(data) {
    var bannerClass = "result-banner--out";
    var statusLabel = "Not in scope (on these answers)";
    var headline = "You do not appear to need MTD for Income Tax yet";

    if (!data.saRegistered) {
      bannerClass = "result-banner--partial";
      statusLabel = "Not registered for Self Assessment";
      headline = "MTD for Income Tax applies to sole traders and landlords registered for Self Assessment";
    } else if (data.inScope) {
      bannerClass = "result-banner--in";
      statusLabel = "In scope";
      headline = data.startPast
        ? "You should already be using Making Tax Digital for Income Tax"
        : "You need Making Tax Digital for Income Tax";
    }

    var metaHtml =
      '<dl class="meta-grid">' +
      '<div class="meta-card"><dt>Qualifying income (estimate)</dt><dd>' +
      formatGBP(data.qualifying) +
      "</dd></div>" +
      '<div class="meta-card"><dt>Tax year checked</dt><dd>' +
      data.wave.label +
      "</dd></div>" +
      '<div class="meta-card"><dt>Relevant threshold</dt><dd>Over ' +
      formatGBP(data.wave.threshold) +
      "</dd></div>" +
      '<div class="meta-card"><dt>Wave / start date</dt><dd>' +
      (data.inScope ? data.wave.wave + " · " + data.wave.start : "—") +
      "</dd></div>" +
      "</dl>";

    var detailParts = [];

    if (!data.saRegistered) {
      detailParts.push(
        "<p>GOV.UK says you need Making Tax Digital for Income Tax only if you are a sole trader or landlord <strong>registered for Self Assessment</strong>, you have self-employment or property income (or both), and your qualifying income is over the relevant threshold.</p>" +
          "<p>If you are not registered but may need to be, check GOV.UK guidance on Self Assessment and the official MTD checker.</p>"
      );
    } else if (data.inScope) {
      detailParts.push(
        "<p>Your combined turnover from self-employment and UK property for <strong>" +
          data.wave.label +
          "</strong> is <strong>" +
          formatGBP(data.qualifying) +
          "</strong>, which is more than the <strong>" +
          formatGBP(data.wave.threshold) +
          "</strong> threshold for that year.</p>" +
          "<p><strong>Start date:</strong> " +
          data.wave.start +
          ". " +
          data.startNote +
          "</p>" +
          (data.alreadySignedUp
            ? "<p>You indicated you have already signed up — confirm your income sources in HMRC online services and keep sending quarterly updates.</p>"
            : "<p>If you have not signed up yet, use the official sign-up service for sole traders and landlords.</p>")
      );
    } else {
      detailParts.push(
        "<p>Your combined turnover for <strong>" +
          data.wave.label +
          "</strong> is <strong>" +
          formatGBP(data.qualifying) +
          "</strong>, which is <strong>not</strong> more than the <strong>" +
          formatGBP(data.wave.threshold) +
          "</strong> threshold for that year’s wave.</p>"
      );
      data.nextHints.forEach(function (h) {
        detailParts.push("<p>" + h + "</p>");
      });
      detailParts.push(
        "<p>HMRC reviews each Self Assessment return separately. Partnerships have a timeline not yet set. Exemptions may apply (for example if you are digitally excluded) — check GOV.UK rather than relying on this page alone.</p>"
      );
    }

    detailParts.push(
      "<p>You still submit a Self Assessment return for the tax year <em>before</em> you start MTD. HMRC may write to people over the threshold, but it remains your responsibility to check.</p>"
    );

    var quartersHtml =
      '<h3>Standard quarterly update windows</h3>' +
      '<p class="hint">Verified from GOV.UK. Deadlines are the same each year for standard (tax-year) periods. Calendar periods also exist — see the guidance.</p>' +
      '<div class="table-wrap"><table>' +
      "<thead><tr><th>Standard update period</th><th>Deadline</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>6 April to 5 July</td><td>7 August</td></tr>" +
      "<tr><td>6 April to 5 October</td><td>7 November</td></tr>" +
      "<tr><td>6 April to 5 January</td><td>7 February</td></tr>" +
      "<tr><td>6 April to 5 April</td><td>7 May (following tax year)</td></tr>" +
      "</tbody></table></div>" +
      "<p class=\"hint\">HMRC will not apply penalty points for late quarterly updates during the 2026 to 2027 tax year. You still need to send updates before you can submit your tax return. Penalty points can still apply for late tax returns.</p>";

    var checklistHtml =
      '<h3>Readiness checklist (8 items)</h3>' +
      '<p class="hint">Tick as you go. This is a practical prompt list, not official HMRC wording.</p>' +
      '<ul class="checklist">' +
      item("c1", "Confirm you are registered for Self Assessment and have submitted a return in the last 2 years (needed to sign up).") +
      item("c2", "Work out qualifying income as turnover (before expenses) from self-employment and property on the relevant return — not profit.") +
      item("c3", "Run the official GOV.UK checker and read the latest guidance and exemption pages.") +
      item("c4", "Choose HMRC-compatible software for digital records and quarterly updates.") +
      item("c5", "Sign up for Making Tax Digital for Income Tax (or confirm HMRC has signed you up) and check income sources.") +
      item("c6", "Keep digital records of income and expenses from your start date.") +
      item("c7", "Diary the four standard quarterly deadlines (7 Aug, 7 Nov, 7 Feb, 7 May).") +
      item("c8", "Plan your Self Assessment return for the year before MTD starts, and the first MTD year-end return via software.") +
      "</ul>";

    function item(id, text) {
      return (
        "<li><input type=\"checkbox\" id=\"" +
        id +
        "\"><label for=\"" +
        id +
        "\">" +
        text +
        "</label></li>"
      );
    }

    var disclaimerHtml =
      '<div class="disclaimer" role="note">' +
      "<strong>This is not tax advice</strong>" +
      "<p>MTD ScopeCheck is an unofficial, one-screen helper. It does not replace HMRC guidance or the official checker. Rules, exemptions and edge cases (joint property, annualising short periods, residence, ceased income, and more) are covered on GOV.UK.</p>" +
      "<ul>" +
      '<li><a href="https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax" target="_blank" rel="noopener">Official guidance: find out if and when you need MTD for Income Tax</a></li>' +
      '<li><a href="https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax" target="_blank" rel="noopener">Official GOV.UK checker tool</a> (on the same page)</li>' +
      '<li><a href="https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax" target="_blank" rel="noopener">What counts as qualifying income</a></li>' +
      '<li><a href="https://www.gov.uk/guidance/sign-up-for-making-tax-digital-for-income-tax" target="_blank" rel="noopener">Sign up (sole traders and landlords)</a></li>' +
      '<li><a href="https://www.gov.uk/guidance/find-out-if-you-can-get-an-exemption-from-making-tax-digital-for-income-tax" target="_blank" rel="noopener">Exemptions (including digitally excluded)</a></li>' +
      "</ul></div>";

    resultEl.innerHTML =
      '<div class="result-banner ' +
      bannerClass +
      '">' +
      '<p class="result-banner__status">' +
      statusLabel +
      "</p>" +
      "<h2>" +
      headline +
      "</h2>" +
      (data.inScope
        ? "<p>" + data.wave.wave + " · start " + data.wave.start + "</p>"
        : "") +
      "</div>" +
      metaHtml +
      detailParts.join("") +
      affiliateHtml(data.inScope) +
      disclaimerHtml +
      (data.inScope || data.saRegistered ? quartersHtml : "") +
      checklistHtml +
      '<div class="actions no-print" style="margin-top:1.25rem">' +
      '<button type="button" class="btn-secondary" id="print-btn-inner">Print result &amp; checklist</button>' +
      "</div>";

    resultEl.classList.add("is-visible");
    var innerPrint = document.getElementById("print-btn-inner");
    if (innerPrint) {
      innerPrint.addEventListener("click", function () {
        window.print();
      });
    }
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var sa = selectedRadio("sa");
    var signedUp = selectedRadio("signedup");
    var taxYear = form.taxYear.value;
    var se = parseMoney(form.soleTrader.value);
    var prop = parseMoney(form.property.value);

    if (sa === null) {
      alert("Please say whether you are registered for Self Assessment.");
      return;
    }
    if (!taxYear || !WAVES[taxYear]) {
      alert("Please choose a tax year.");
      return;
    }
    if (Number.isNaN(se) || Number.isNaN(prop)) {
      alert("Please enter valid amounts (0 or more) for both income fields.");
      return;
    }

    var wave = WAVES[taxYear];
    var qualifying = se + prop;
    var saRegistered = sa === "yes";
    var inScope = saRegistered && qualifying > wave.threshold;
    var startInfo = startDateStatus(wave.startISO);

    renderResult({
      saRegistered: saRegistered,
      alreadySignedUp: signedUp === "yes",
      taxYear: taxYear,
      wave: wave,
      qualifying: qualifying,
      inScope: inScope,
      startPast: startInfo.past,
      startNote: startInfo.text,
      nextHints: nextWaveHint(taxYear, qualifying)
    });
  });

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }
})();
