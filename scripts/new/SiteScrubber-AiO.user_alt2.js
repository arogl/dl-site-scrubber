// ==UserScript==
// @name         SiteScrubber - All-in-One
// @namespace    SiteScrubber
// @version      2.0.0
// @description  Scrub site of ugliness and ease the process of downloading from multiple sites!
// @author       PrimePlaya24
// @license      GPL-3.0-or-later; https://www.gnu.org/licenses/gpl-3.0.txt
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/SiteScrubber-aio_icon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-AiO.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-AiO.user.js
// @include      /^(?:https?:\/\/)?(?:www\.)?dropapk\.(to|com)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?drop\.download\//
// @include      /^(?:https?:\/\/)?(?:www\.)?mixloads\.com//
// @include      /^(?:https?:\/\/)?(?:www\.)?dropgalaxy\.(in|com)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?financemonk\.net\//
// @include      /^(?:https?:\/\/)?(?:www\.)?tech(ssting|yneed)\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?file-up(load)?\.(com|org)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?up-load\.io\//
// @include      /^(?:https?:\/\/)?(?:www\.)?uploadrar\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?mega4up\.(com|org)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?userupload\.(in|net)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?rapidgator\.net\/(file|download\/captcha)/
// @include      /^(?:https?:\/\/)?(?:www\.)?katfile\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?upload-4ever\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?uploadev\.org\//
// @include      /^(?:https?:\/\/)?(?:www\.)?apkadmin\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?upfiles\.(io|com)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?hexupload\.net\//
// @include      /^(?:https?:\/\/)?(?:www\.)?usersdrive\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?khabarbabal\.online\//
// @include      /^(?:https?:\/\/)?(?:www\.)?dlsharefile\.(com|org)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?file4\.net\//
// @include      /^(?:https?:\/\/)?(?:www\.)?dailyuploads\.net\//
// @include      /^(?:https?:\/\/)?(?:www\.)?indi-share\.(com|net)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?techmyntra\.(com|net)\//
// @include      /^(?:https?:\/\/)?(?:www\.)?depositfiles\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?clicknupload\.cc\//
// @include      /^(?:https?:\/\/)?(?:www\.)?veryfiles\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?douploads\.net\//
// @include      /^(?:https?:\/\/)?(?:www\.)?tusfiles\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?centfile\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?short\.katflys\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?fastclick\.to\//
// @include      /^(?:https?:\/\/)?(?:www\.)?chedrive\.com\//
// @include      /^(?:https?:\/\/)?(?:www\.)?nitro\.download\//
// @run-at       document-start
// @grant        none
// ==/UserScript==

class SiteScrubber {
  constructor(rules) {
    this.o_debug = true;
    this.ssButtonWatchDog = false;

    this.window = window;
    this.document = window.document;
    this.logNative = window.console.log;
    /*
    uBlock Origin replaces window.open with a Proxy,
    might need a work around to allow opening download
    links when users have this extension enabled.
    */
    this.openNative = window.open.bind(window);
    this.url = document.location.href;
    this.host = document.location.host;
    this.domain = document.domain;
    this.$ = document.querySelector.bind(document);
    this.$$ = document.querySelectorAll.bind(document);

    this.origAddEventListener = EventTarget.prototype.addEventListener;
    this.origAppendChild = HTMLElement.prototype.appendChild;
    this.origSetInterval = window.setInterval.bind(window);
    this.origClearInterval = window.clearInterval.bind(window);
    this.origSetTimeout = window.setTimeout.bind(window);
    this.origClearTimeout = window.clearTimeout.bind(window);

    this.countdownSecondsLeft = 0;

    this._buttons = [];
    this._intervals = {};
    this._listeners = [];
    this._timeouts = {};

    this.currSiteRules = rules;
    // this.siteRules = siteRules;
    // this.addCustomCSSStyle(this.siteRules.customStyle);
  }
  setup() {
    this.logDebug("Initializing SiteScrubber...");

    this.destroyWindowFunctions(this.currSiteRules?.destroyWindowFunctions);
    this.addCustomCSSStyle(
      `.ss-btn{display:inline-block!important;padding:24px 32px!important;border:unset!important;color:#dfdfdf!important;background:#9d0000!important;text-transform:uppercase!important;font-size:24px!important;letter-spacing:.15em!important;transition:all .1s!important;position:relative!important;overflow:hidden!important;z-index:1!important}.ss-w-100{width:100%!important}.ss-btn-ready:after{content:"";position:absolute;bottom:0;left:0;width:100%;height:100%;background-color:#109d00;transition:all .1s;z-index:-2}.ss-btn-ready:before{content:"";position:absolute;bottom:0;left:0;width:0%;height:100%;background-color:#1a0;transition:all .1s linear;z-index:-1}.ss-btn-ready:hover:before{width:100%;transition:all 2s linear}.ss-btn:active{transform:scale(.975)!important}.ss-btn:focus{outline:0!important}`
    );
    this.addCustomCSSStyle(
      `.ss-alert-warning{color:#8a6d3b;background-color:#fcf8e3;border-color:#faebcc}.ss-alert{width:100%;padding:15px;margin-bottom:20px;border:1px solid transparent;border-radius:4px}.ss-col-md-12{width:100%}.ss-mt-5{margin-top:5em}.ss-text-center{text-align:center}`
    );
    if (this.ssButtonWatchDog === true) {
      // Ready, so click/submit
      this.waitUntilSelector(".ss-btn-ready").then((ssBtn) => {
        // return this.log("WOULD'VE CLICKED ss-btn");
        ssBtn.click();
      });
    }
    if (
      this.document.readyState === "complete" ||
      this.document.readyState === "interactive"
    ) {
      this.logDebug("Site is ready, applying rules...");
      this.applyRules();
    } else {
      this.logDebug(
        "Waiting to apply rules once page is ready. Event listener added."
      );
      this.origAddEventListener.apply(window, [
        "DOMContentLoaded",
        () => {
          this.applyRules();
          this.logDebug("Site is ready, applying rules...");
        },
      ]);
    }
    return this;
  }
  log(str) {
    this.logNative(`[SS-LOG] ${str}`);
  }
  logDebug(str) {
    if (this.o_debug) this.logNative(`[SS-DEBUG] ${str}`);
  }
  logDebugNaked(str) {
    if (this.o_debug) this.logNative(str);
  }
  plug(data) {
    if (arguments.callee.counter) {
      arguments.callee.counter++;
    } else {
      arguments.callee.counter = 1;
    }
    this.logDebug(data);
    this.logDebugNaked(arguments);
    // this.window.alert(data);
  }
  ifElementExists(query, fn = () => void 0) {
    return this.$(query) && fn(this.$(query));
  }
  addCustomCSSStyle(cssStr) {
    if (!cssStr) {
      return;
    }
    this.logDebug("Adding custom CSS styles");
    // make new <style> element
    const newNode = this.document.createElement("style");
    // set the inner text to the user input
    newNode.textContent = cssStr;
    // select where to place our <style> element
    const targ =
      this.document.head || this.document.body || this.document.documentElement;
    // append our <style> element to the page
    targ.appendChild(newNode);
  }
  async waitUntilSelector(query) {
    if (!query) {
      return;
    }
    this.logDebug(`Waiting for selector: ${query}`);
    while (!this.$(query)) {
      // if not found, wait and check again in 500 milliseconds
      await new Promise((r) => this.origSetTimeout(r, 500));
    }
    this.logDebug(`Found element by selector: ${query}`);
    return new Promise((resolve) => {
      // resolve/return the found element
      resolve(this.$(query));
    });
  }
  async waitUntilGlobalVariable(...variableNames) {
    this.logDebug(
      `Waiting for global variable: window.${variableNames.join(".")}`
    );
    let curr = window;
    while (curr == window || curr == undefined) {
      curr = window;
      for (const k of variableNames) {
        if (curr == undefined) break;
        curr = curr?.[k];
      }
      // if not found, wait and check again in 500 milliseconds
      await new Promise((r) => this.origSetTimeout(r, 500));
    }
    this.logDebug(`Found global variable: window.${variableNames.join(".")}`);
    return new Promise((resolve) => {
      // resolve/return the found element
      resolve(curr);
    });
  }
  // not needed?
  finalDownloadLinkOpener(query, regex) {
    if (!query) {
      return;
    }
    this.logDebug(
      `Trying to find final download link using: [${query}, ${regex}]`
    );
    this.waitUntilSelector(query).then((element) => {
      if (
        regex instanceof RegExp &&
        !regex.test(this.document.body.innerText)
      ) {
        this.log("DDL Link not found on this page or Regex test failed.");
      } else {
        this.log("DDL Link was found on this page.");
        this.openNative?.(element?.href, "_self");
        this.logDebug(
          `finalDownloadLinkOpener() - ${element?.tagName}.href: ${element?.href}`
        );
        this.logDebug("Opening DDL link for file.");
      }
    });
  }
  removeElements(elements) {
    if (!elements) {
      return;
    }
    this.logDebug("Running removeElements");
    if (typeof elements == "string" || elements instanceof String) {
      // add it to an array so we can use Array functions
      elements = [elements];
    }
    [...elements].forEach((e) => {
      if (typeof e == "string" || e instanceof String) {
        // remove found elements
        this.$$(e).forEach((ele) => ele.remove());
        // this.$$(e).forEach((ele) => (ele.style.display = "none"));
      } else if (e instanceof HTMLElement) {
        // remove HTMLElement
        e.remove();
      }
    });
  }
  removeElementsByRegex({ query, regex }) {
    if (!query) {
      return;
    }
    this.logDebug("Running removeElementsByRegex");
    this.$$(query).forEach((ele) => {
      if (regex.test(ele.innerText)) {
        // remove found elements if RegEx matches
        ele.remove();
      }
    });
  }
  addJQuery() {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js";
    const targ =
      this.document.head || this.document.body || this.document.documentElement;
    targ.appendChild(s);
  }
  addInterval({ fn, interval, customID }) {
    let error = false;
    if ("function" !== typeof fn) {
      this.logDebug("addInterval() - Bad function input");
      error = true;
    } else if ("number" !== typeof interval) {
      this.logDebug("addInterval() - Bad interval input");
      error = true;
    } else if ("string" !== typeof customID) {
      this.logDebug("addInterval() - Bad customID input");
      error = true;
    }
    if (error) {
      this.logDebugNaked(arguments);
      return;
    }
    const id = this.origSetInterval(fn, interval);
    this._intervals[customID || id] = {
      fn: fn.toString(),
      interval: interval,
      id: id,
      customID: customID,
    };
    return id;
  }
  removeInterval(id) {
    const interval = this._intervals[id]["id"];
    if (interval) {
      delete this._intervals[id];
      return this.origClearInterval(interval);
    } else {
      this.logDebug(
        `removeInterval() - Failed to remove interval with ID: ${id}`
      );
    }
  }
  addTimeout({ fn, timeout, customID }) {
    let error = false;
    if ("function" !== typeof fn) {
      this.logDebug("addTimeout() - Bad function input");
      error = true;
    } else if ("number" !== typeof timeout) {
      this.logDebug("addTimeout() - Bad timeout input");
      error = true;
    } else if ("string" !== typeof customID || !(customID instanceof String)) {
      this.logDebug("addTimeout() - Bad customID input");
      error = true;
    }
    if (error) {
      this.logDebugNaked(arguments);
      return;
    }
    const id = this.origSetTimeout(fn, timeout);
    this._timeouts[customID || id] = {
      fn: fn.toString(),
      timeout: timeout,
      id: id,
      customID: customID,
    };
    return customID || id;
  }
  removeTimeout(id) {
    const timeout = this._timeouts[id]["id"];
    if (timeout) {
      delete this._timeouts[id];
      return this.origClearTimeout(timeout);
    } else {
      this.logDebug(
        `removeTimeout() - Failed to remove timeout with ID: ${id}`
      );
    }
  }
  addListener({ element, event, listener, options }) {
    let error = false;
    if ("string" !== typeof event) {
      this.logDebug("addListener() - Bad event input");
      error = true;
    } else if ("function" !== typeof listener) {
      this.logDebug("addListener() - Bad listener input");
      error = true;
    }
    if (error) {
      this.logDebugNaked(arguments[0]);
      return;
    }
    const el = element;
    if (!el?.trackedEvents) {
      el.trackedEvents = {};
    }
    if (!el.trackedEvents[event]) {
      el.trackedEvents[event] = listener;
    } else if (el.trackedEvents[event].toString() == listener.toString()) {
      this.logDebug(`addListener() - event '${event}' already added`);
      this.logDebugNaked(arguments[0]);
      return;
    }
    this._listeners.push(arguments[0]);
    return this.origAddEventListener.bind(el)(
      event,
      listener,
      options || false
    );
  }
  removeListener({ element, event }) {
    if (!element?.trackedEvents) {
      this.logDebug("removeListener() - No events found");
      return;
    }
    const el = element;
    const listener = el.trackedEvents[event];
    delete el.trackedEvents[event];
    const removeObj = this._listeners.find(
      (x) => x.element == el && x.listener == listener
    );
    this._listeners = this._listeners.filter((x) => x != removeObj);
    return el.removeEventListener(event, listener);
  }
  // not needed?
  async addCaptchaListener(formElement, timer = 0) {
    const form = this.getDOMElement(formElement);
    if (form === null) {
      this.log("No Google Captcha found...");
      this.logDebug("addCaptchaListener() - failed to find element");
      return;
    } else {
      this.log("Form selected!");
    }

    // const buttonStatusInterval = this.addInterval({
    //   fn: () => {
    //     if (this.window.grecaptcha?.getResponse?.()) {
    //       this._buttons.forEach((button) => {
    //         button.classList.add("ss-ready");
    //         // button.classList.remove("ss-incomplete");
    //       });
    //     } else {
    //       this._buttons.forEach((button) => {
    //         // button.classList.add("ss-incomplete");
    //         button.classList.remove("ss-ready");
    //       });
    //     }
    //   },
    //   interval: 100,
    //   customID: "ss-button-checker",
    // });

    return new Promise((res, rej) => {
      // save current date
      const then = new Date();
      let counter = 0;
      const INTERVAL = 250;
      // interval to check every 250 milliseconds if ReCAPTCHA
      // has been completed, then the form gets submitted
      const checker = this.addInterval({
        fn: () => {
          if (
            (window.grecaptcha?.getResponse?.() ||
              window.hcaptcha?.getResponse?.()) &&
            Math.floor((new Date() - then) / 1000) > timer
          ) {
            // stop interval from continuing
            // clearInterval(checker);
            this.removeInterval("RecaptchaListenerInterval");
            formElement.submit();
            res();
          } else {
            counter++;
          }
          if (counter >= 7200) {
            // stop interval and give up checking
            // clearInterval(checker);
            this.removeInterval("RecaptchaListenerInterval");
            res();
          }
        },
        interval: INTERVAL,
        customID: "RecaptchaListenerInterval",
      });
    });
  }
  async createGoogleRecaptcha(elementTarget, site_key, position = "beforeend") {
    const target = this.getDOMElement(elementTarget);
    if (target === null) {
      this.logDebug("createGoogleRecaptcha - failed to find element");
      return;
    }
    this.logDebug("createGoogleRecaptcha() - element to add under");
    this.logDebugNaked(target);
    const script = this.document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    this.document.body.appendChild(script);
    this.waitUntilGlobalVariable("grecaptcha").then(() => {
      target.insertAdjacentHTML(
        position,
        `<div id="ss-recaptcha" data-sitekey="${site_key}" data-starttime="${+new Date()}"></div>`
      );
      grecaptcha.render("ss-recaptcha", {
        sitekey: site_key,
      });
    });
  }
  modifyGoogleRecaptcha(timer = 0, cb) {
    const grecaptchaElem = this.$(".g-recaptcha");
    const site_key = grecaptchaElem?.getAttribute("data-sitekey");
    grecaptchaElem.innerHTML = `<div id="ss-recaptcha" data-sitekey="${site_key}" data-starttime="${+new Date()}"></div>`;
    grecaptcha.render("ss-recaptcha", {
      sitekey: site_key,
      callback:
        cb ||
        function () {
          const form = siteScrubber.findParentElementByTagName(
            siteScrubber.$("#ss-recaptcha"),
            "form"
          );
          if (form) {
            form.submit();
          }
        },
    });
  }
  removeIFrames() {
    this.log("Removing unwanted scripts from page");
    let i = 0;
    this.$$("iframe").forEach((iframe) => {
      if (!/google/gi.test(iframe.src)) {
        iframe.remove();
        i++;
      }
    });
    this.logDebug(`Removed ${i} iFrames`);
  }
  removeDisabledAttr() {
    this.log("Enabling all buttons");
    this.$$("*").forEach((e) => {
      e.removeAttribute("disabled");
    });
  }
  hideElementsByDisplay(elements = []) {
    if (elements.length === 0) {
      return;
    }
    this.log("Running hideElementsByDisplay");
    if (this.isQueryString(elements)) {
      elements = [elements];
    }
    [...elements].forEach((e) => {
      if (this.isQueryString(e)) {
        this.$$(e).forEach((ele) => (ele.style.display = "none"));
      } else if (this.isElement(e)) {
        e.style.display = "none";
      }
    });
    this.logDebug(`Elements hidden: ${elements}`);
  }
  hideElementsByVisibility(elements = []) {
    if (elements.length === 0) {
      return;
    }
    this.log("Running hideElementsByVisibility");
    if (this.isQueryString(elements)) {
      elements = [elements];
    }
    [...elements].forEach((e) => {
      if (this.isQueryString(e)) {
        this.$$(e).forEach((ele) => (ele.style.visibility = "hidden"));
      } else if (this.isElement(e)) {
        e.style.visibility = "hidden";
      }
    });
    this.logDebug(`Elements hidden: ${elements}`);
  }
  async sleep(ms) {
    const _this = this;
    return new Promise((resolve) => _this.origSetTimeout(resolve, ms));
  }
  findParentElementByTagName(el, tagName) {
    const tag = tagName.toLowerCase();

    while (el && el.parentNode) {
      el = el.parentNode;
      if (el.tagName && el.tagName.toLowerCase() == tag) {
        return el;
      }
    }
    return null;
  }
  checkIfDownloadPage(arrayOfSelectors = [], arrayOfRegexTests = []) {
    if (
      (arrayOfSelectors instanceof Array &&
        arrayOfSelectors.some((selector) =>
          Boolean(this.document.querySelector(selector))
        )) ||
      (arrayOfRegexTests instanceof Array &&
        arrayOfRegexTests.some((regex) =>
          regex?.test(this.document.body.innerText)
        ))
    ) {
      this.logDebug("Found something! Assuming this is a download page!");
      return true;
    }
    this.logDebug("Found nothing! Skipping this page. Not a downloading page.");
    this.logDebug(
      `checkIfDownloadPage() - ${arrayOfSelectors}, ${arrayOfRegexTests}`
    );
    return false;
  }
  isElement(element) {
    return element instanceof Element;
  }
  isQueryString(query) {
    return (
      !this.isElement(query) &&
      (typeof query == "string" || query instanceof String)
    );
  }
  isEmptyObject(obj) {
    return JSON.stringify(obj) === "{}";
  }
  getDOMElement(request) {
    if (this.isElement(request)) {
      return request;
    } else if (this.isQueryString(request)) {
      return this.$(request);
    }
    return null;
  }
  addHoverAbility(element, requireCaptcha = false) {
    if (!element) {
      return;
    }
    const addEvent = (element) => {
      let fn = () => {};
      if (requireCaptcha) {
        fn = () => {
          element.dataset.timeout = this.origSetTimeout(() => {
            if (
              this.countdownSecondsLeft === 0 &&
              window.grecaptcha?.getResponse?.()
            ) {
              element.click();
            }
          }, 2000);
        };
      } else {
        fn = () => {
          element.dataset.timeout = this.origSetTimeout(() => {
            if (this.countdownSecondsLeft === 0) {
              element.click();
            }
          }, 2000);
        };
      }
      // this.origAddEventListener.bind(element)("mouseenter", fn, false);
      this.addListener({
        element: element,
        event: "mouseenter",
        listener: fn,
        options: false,
      });
      this.logDebug(`Added 'mouseenter' event to ${element.innerHTML}`);
      // this.origAddEventListener.bind(element)(
      //   "mouseleave",
      //   () => {
      //     clearTimeout(element.dataset.timeout);
      //   },
      //   false
      // );
      this.addListener({
        element: element,
        event: "mouseleave",
        listener: () => {
          clearTimeout(element.dataset.timeout);
        },
        options: false,
      });
      this.logDebug(`Added 'mouseleave' event to ${element.innerHTML}`);
    };
    // if (typeof element == "string" || element instanceof String) {
    //   element = [element];
    // }
    if (!Array.isArray(element)) {
      element = [element];
    }
    [...element].forEach((e) => {
      if (typeof e == "string" || e instanceof String) {
        this.$$(e).forEach(addEvent);
      } else if (e instanceof HTMLElement) {
        addEvent(e);
      }
    });
  }
  addInfoBanner({ targetElement, where = "beforeend" }) {
    if (targetElement instanceof HTMLElement) {
      // Already an HTMLElement
    } else if (
      typeof targetElement == "string" ||
      targetElement instanceof String
    ) {
      targetElement = this.$(targetElement);
    }
    if (!targetElement) {
      return;
    }
    this.logDebug("Adding SiteScrubber hover info banner");

    const newNode = `<div class="ss-alert ss-alert-warning ss-mt-5 ss-text-center">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>`;
    targetElement.insertAdjacentHTML(where, newNode);
    this.logDebug(
      `addInfoBanner() - elementToAddTo: ${targetElement}, ${where}`
    );
  }
  destroyWindowFunctions(options = []) {
    this.logDebug(`Destroying window functions: [${options.join(", ")}]`);
    if (void 0 === options || options.length == 0) {
      return;
    }
    const whitelist = [
      "siteScrubber",
      "$",
      "$$",
      "jQuery",
      "___grecaptcha_cfg",
      "grecaptcha",
      "__recaptcha_api",
      "__google_recaptcha_client",
      "recaptcha",
    ];
    for (const option of options) {
      // window[option] = function () {};
      if (whitelist.includes(option)) {
        this.logDebug(`Skipping destroy of ${option}`);
        continue;
      }
      try {
        this.window.Object.defineProperty(this.window, option, {
          configurable: false,
          set(value) {
            return function () {};
          },
          get() {
            return function () {};
          },
        });
        // this.logDebug(`Destoyed window function: 'window.${option}'`);
      } catch (e) {
        this.logDebug(`FAILED to destroy window function: 'window.${option}'`);
        this.logDebug(e);
      }
    }
  }
  interceptAddEventListeners(fn) {
    this.log("Adding addEventListener hook");
    const _this = this;
    EventTarget.prototype.addEventListener = function (
      event,
      listener,
      bubbling
    ) {
      let allow = true;
      if (fn !== undefined && typeof fn === "function") {
        allow = !!fn.apply(this, arguments);
      } else if (/grecaptcha|google/.test(listener.toString())) {
        allow = true;
      } else if (
        event === "click" ||
        event === "mousedown" ||
        event === "mouseup" ||
        event === "onunload" ||
        event === "beforeunload"
      ) {
        allow = false;
      }
      if (allow) {
        _this.logDebug(`Allowing event type: ${event}`);
        _this.logDebugNaked(listener);
        _this.origAddEventListener.apply(this, arguments);
      } else {
        _this.logDebug(`Intercepted attaching event listener: '${event}'`);
      }
    };
  }
  interceptAJAX(fn) {
    this.log("Adding AJAX hook");
    const _this = this;
    this.waitUntilGlobalVariable("jQuery").then(function () {
      const origAJAX = window.jQuery?.ajax;
      window.jQuery.origAJAX = origAJAX;
      window.jQuery.ajax = function () {
        let allow = true;
        if (fn !== undefined && typeof fn === "function") {
          allow = !!fn.apply(this, arguments);
        } else if (arguments?.[0]?.url?.search("xxx") > -1) {
          allow = false;
        }
        if (allow) {
          return origAJAX.apply(this, arguments);
        } else {
          _this.log("Stopped AJAX call");
          _this.logDebug(`Blocked: ${arguments?.[0]?.url}`);
        }
      };
    });
  }
  interceptAppendChild(fn) {
    const _this = this;
    const customAppendChild = function (node) {
      let allow = true;
      if (fn !== undefined && typeof fn === "function") {
        allow = !!fn.apply(this, arguments);
      } else if (
        node.tagName === "SCRIPT" ||
        node.tagName === "IFRAME" ||
        node.tagName === "LINK"
      ) {
        if (!/grecaptcha|google\./gi.test(node.src)) {
          allow = false;
        }
      } else if (node.style.zIndex === "2147483647") {
        allow = false;
      }
      if (allow) {
        _this.logDebug(`Allowing appending child: ${node.tagName}`);
        return _this.origAppendChild.apply(this, arguments);
      } else {
        _this.logDebug(
          `Intercepted attaching event listener: '${node.tagName}'`
        );
      }
    };
    HTMLElement.prototype.appendChild = customAppendChild;
    _this.document.appendChild = customAppendChild;
  }
  createCountdown({ element, timer }) {
    let el = this.getDOMElement(element);
    if (!this.isElement(el)) {
      this.logDebug("createCountdown - failed to find element");
      this.logDebugNaked(arguments);
      return;
      el = this.document.createElement("i");
    } else if (timer) {
      el.innerText = timer;
    } else {
      timer = +el?.innerText || 30;
    }

    this.logDebug("createCountdown - found element, creating timer");
    this.countdownSecondsLeft = timer;
    
  const tick = () => {
    const remaining = --this.countdownSecondsLeft;
    const ele = this.getDOMElement(el) || this.document.createElement("i");
    ele.innerText = remaining;
    if (remaining <= 0) {
      this.removeInterval("countdown-interval");
    } else {
      this.logDebug(`Tick: ${remaining}`);
    }
  }
    this.addInterval({
      fn: tick,
      interval: 1000,
      customID: "countdown-interval",
    });
  }
  tick(element) {
    const remaining = --this.countdownSecondsLeft;
    const el = this.getDOMElement(element) || this.document.createElement("i");
    el.innerText = remaining;
    if (remaining <= 0) {
      this.removeInterval("countdown-interval");
    } else {
      this.logDebug(`Tick: ${remaining}`);
    }
  }
  copyAttributesFromElement(sourceElement, targetElement) {
    if (
      sourceElement instanceof HTMLElement &&
      targetElement instanceof HTMLElement
    ) {
      [...sourceElement.attributes].forEach((attr) => {
        targetElement.setAttribute(attr.nodeName, attr.nodeValue);
      });
    } else {
      this.log(
        "copyAttributesFromElement() - failed to copy attributes with given elements"
      );
      this.logDebugNaked(sourceElement);
      this.logDebugNaked(targetElement);
    }
  }
  modifyButton(
    button,
    {
      disabled = false,
      replaceWithForm = false,
      replaceWithTag,
      copyAttributesFromElement,
      customText,
      className,
      href,
      props,
      styles,
      attributes,
      eventHandlers,
      makeListener,
      requiresCaptcha,
      requiresTimer,
      addHoverAbility,
      moveTo = {
        target: undefined,
        position: undefined,
        findParentByTag: undefined,
      },
      fn = () => {},
    } = {}
  ) {
    button = this.getDOMElement(button);

    if (null === button) {
      this.logDebug("modifyButton - failed to find element");
      return;
    }

    // Custom function (if needed) to modify button by hand
    fn(button);

    // Check and alert user of mixed content error
    if (button.tagName === "A") {
      const dl_link = button.href;
      if (
        this.window.location.href.match(/^https:/i) &&
        !dl_link.match(/^https:/i)
      ) {
        // https://blog.chromium.org/2020/02/protecting-users-from-insecure.html
        this.document.body.insertAdjacentHTML(
          "afterbegin",
          `<p class='ss-alert ss-alert-warning ss-text-center'>This file should be served over HTTPS. This download has been blocked. See <a href='https://blog.chromium.org/2020/02/protecting-users-from-insecure.html'>https://blog.chromium.org/2020/02/protecting-users-from-insecure.html</a> for more details.</p>`
        );
      }
    }

    if (replaceWithForm === true) {
      const safeFormOptions = {
        actionURL: button.href || href || "",
        method: "GET",
      };
      // if (button.tagName === "A") {
      //   safeFormOptions.actionURL = button.href || href || "";
      // } else {
      //   safeFormOptions = {
      //     actionURL: href || "",
      //   }
      // }
      const form = this.makeSafeForm(safeFormOptions);
      button.parentElement.replaceChild(form, button);
      button = form.querySelector(".ss-btn");
    } else if (replaceWithTag && typeof replaceWithTag === "string") {
      const customTag = this.document.createElement(replaceWithTag);
      if (this.isElement(copyAttributesFromElement)) {
        this.copyAttributesFromElement(copyAttributesFromElement, customTag);
      } else {
        this.copyAttributesFromElement(button, customTag);
      }
      button.parentElement.replaceChild(customTag, button);
      button = customTag;
    }

    this._buttons.push(button);

    if (customText) {
      button.innerHTML = customText;
    }
    button.className = className || "ss-btn ss-w-100";
    for (const key in props) {
      button[key] = props[key];
    }
    for (const key in styles) {
      button.style[key] = styles[key];
    }
    for (const key in attributes) {
      button.setAttribute(key, attributes[key]);
    }
    for (const key in eventHandlers) {
      button.addEventListener(key, eventHandlers[key]);
    }

    if (makeListener === true) {
      let fn = () => {};
      if (requiresCaptcha === true) {
        fn = () => {
          if (
            this.countdownSecondsLeft === 0 &&
            (window.grecaptcha?.getResponse?.() ||
              window.hcaptcha?.getResponse?.())
          ) {
            button.classList.add("ss-btn-ready");
          } else {
            button.classList.remove("ss-btn-ready");
          }
        };
      } else {
        fn = () => {
          if (this.countdownSecondsLeft === 0) {
            button.classList.add("ss-btn-ready");
          } else {
            button.classList.remove("ss-btn-ready");
          }
        };
      }
      this.addInterval({
        fn: fn,
        interval: 100,
        customID: "ss-btn-ready-listner",
      });
    }
    if (addHoverAbility !== false) {
      if (!requiresCaptcha && !requiresTimer) {
        button.classList.add("ss-btn-ready");
      }
      this.addHoverAbility(button, !!requiresCaptcha);
    }
    /**
     * target
     * position
     * findParentByTag
     */
    if (moveTo.target && moveTo.position) {
      let el = this.getDOMElement(moveTo.target);
      const pos = moveTo.position;
      const findParentByTag = moveTo.findParentByTag;

      if (null === el) {
        this.logDebug("modifyButton.moveTo - failed to find element");
      } else {
        let target = el;
        if (findParentByTag) {
          target = this.findParentElementByTagName(el, findParentByTag);
        }
        button.remove();
        target.insertAdjacentElement(pos, button);
      }
    }
    if (disabled !== true) {
      button.disabled = false;
    }
    return button;
  }
  makeSafeForm({ actionURL, method = "GET", target = "_blank" }) {
    const form = this.document.createElement("form");
    form.action = actionURL;
    form.method = method;
    form.target = target;

    const submitBtn = this.document.createElement("button");
    submitBtn.type = "submit";
    this.modifyButton(submitBtn, { customText: "Start Download" });
    form.appendChild(submitBtn);
    return form;
  }
  applyRules() {
    console.time("ss");
    this.log("STARTING CLEANER!");

    if (
      !this.checkIfDownloadPage(
        this.currSiteRules?.downloadPageCheckBySelector,
        this.currSiteRules?.downloadPageCheckByRegex
      )
    ) {
      this.log("Did not match as a download page... Stopping.");
      return;
    } else {
      this.log("Assuming this is a download page.");
    }
    this.addCustomCSSStyle(this.currSiteRules?.customStyle);
    this.log("Added custom CSS styling");

    if (this.currSiteRules?.createCountdown) {
      this.createCountdown(this.currSiteRules?.createCountdown);
      this.log(`Created countdown`);
      this.logDebugNaked(this.currSiteRules?.createCountdown);
    }
    this.removeElements(this.currSiteRules?.remove);
    // this.plug("Removed Elements");
    // this.currSiteRules?.removeByRegex?.forEach(([selector, regex]) =>
    //   this.removeElementsByRegex(selector, regex)
    // );
    this.currSiteRules?.removeByRegex?.forEach((removeByRegexOptions) =>
      this.removeElementsByRegex(removeByRegexOptions)
    );
    this.log("Removed elements");
    // this.plug("Removed Elements By Regex");

    //////////////
    this.hideElementsByDisplay(this.currSiteRules?.hideElementsByDisplay);
    // this.log("Hid elements");
    //////////////

    if (this.currSiteRules?.removeIFrames) {
      this.removeIFrames();
      this.log("Removed iFrames");
    }
    if (this.currSiteRules?.removeDisabledAttr) {
      this.removeDisabledAttr();
      this.log("Removed 'disabled' attribute from all elements");
    }
    this.currSiteRules?.finalDownloadElementSelector?.forEach(
      ([selector, regex]) => this.finalDownloadLinkOpener(selector, regex)
    );
    this.currSiteRules?.addHoverAbility?.forEach(
      ([elements, requiresCaptcha]) =>
        this.addHoverAbility(elements, requiresCaptcha)
    );
    // this.currSiteRules?.addInfoBanner?.forEach(([element, where]) =>
    //   this.addInfoBanner(element, where)
    // );
    this.currSiteRules?.addInfoBanner?.forEach((addInfoBannerOptions) =>
      this.addInfoBanner(addInfoBannerOptions)
    );
    if (this.currSiteRules?.modifyButtons) {
      this.currSiteRules?.modifyButtons?.forEach(([button, options]) => {
        this.modifyButton(button, options);
      });
    }
    this.log("Running site's custom made script");
    this.currSiteRules?.customScript?.bind(this)?.();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const siteRules = {
  dropapk: {
    host: ["drop.download", "dropapk.to"],
    customStyle: `html,body,#container{background:#121212!important;color:#dfdfdf!important}.download_box,.download_method{background-color:#323232!important}.bg-white{background:#121212!important}table span{color:red!important}`,
    downloadPageCheckBySelector: [
      "button#method_free",
      "button#downloadbtn",
      "div.download_box",
    ],
    downloadPageCheckByRegex: [
      /Slow download/gi,
      /your IP next 8 hours/gi,
      /Enter code below/gi,
    ],
    remove: [
      ".adsbox",
      "#content",
      ".features__section",
      "footer",
      "nav",
      ".payment_methods",
      "adsbox",
      ".features",
      "div.header",
      // "#container > form > div > div > div.col-md-4:nth-child(-n+3)",
    ],
    removeByRegex: [{ query: ".download_method", regex: /fast download/gi }],
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "setPagination",
      "gtag",
      "dataLayer",
      "google_tag_manager",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "adsbygoogle",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "google_user_agent_client_hint",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_apltlad",
      "google_spfd",
      "google_lpabyc",
      "google_unique_id",
      "google_sv_map",
      "Dialogs",
      "__core-js_shared__",
      "feather",
      "google_ama_state",
      "gaplugins",
      "gaGlobal",
      "gaData",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "google_llp",
      "googletag",
      "GoogleGcLKhOms",
      "google_image_requests",
      "timeout",
      "delComment",
      "player_start",
      "showFullScreen",
    ],
    addInfoBanner: [{ targetElement: "div.download_box" }],
    modifyButtons: [
      ["button#method_free", { customText: "Free Download" }],
      ["button#downloadbtn", { requiresCaptcha: true }],
      ["div.download_box > a", { replaceWithForm: true }],
    ],
    customScript() {
      // automation
      const captcha_box = this.$(
        ".download_box table td > div[style]:not([class])"
      );
      if (captcha_box) {
        const captcha_code = [...captcha_box?.children]
          .sort(
            (x, y) =>
              x.getAttribute("style").match(/padding-left:(\d+)/)?.[1] -
              y.getAttribute("style").match(/padding-left:(\d+)/)?.[1]
          )
          .map((e) => e.textContent)
          .join("");
        this.$("input.captcha_code").value = captcha_code;
        document.forms?.F1?.submit();
      }

      // aesthetics
      this.ifElementExists(
        "div[style*='direction:ltr']",
        (div) => (div.style.background = "#000")
      );
      this.$$(".col-md-4").forEach((div) =>
        div.classList.replace("col-md-4", "col-12")
      );
      this.$("p.mb-5")?.classList.remove("mb-5");
      this.addInfoBanner({
        targetElement: "#container .container .row",
        where: "beforeend",
      });
    },
  },
  mixloads: {
    host: ["mixloads.com"],
    customStyle: `html,body,#container,div.download_method{background:#121212!important;color:#dfdfdf!important}.download_box{background-color:#323232!important}.bg-white{background:#121212!important}`,
    downloadPageCheckBySelector: [
      "button#method_free",
      "button#downloadbtn",
      "div.download_box",
    ],
    downloadPageCheckByRegex: [
      /Slow download/gi,
      /your IP next 8 hours/gi,
      /Enter code below/gi,
    ],
    remove: [
      ".adsbox",
      "#content",
      ".col-md-8",
      ".features__section",
      "footer",
      "nav",
      ".payment_methods",
      "adsbox",
      "ul.features",
    ],
    removeByRegex: [{ query: ".download_method", regex: /fast download/gi }],
    hideElementsByDisplay: ["table"],
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "setPagination",
      "_gaq",
      "_gat",
      "gaGlobal",
      "timeout",
      "adsbygoogle",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_apltlad",
      "google_spfd",
      "google_lpabyc",
      "google_unique_id",
      "google_sv_map",
      "google_user_agent_client_hint",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "delComment",
      "player_start",
      "showFullScreen",
      "__core-js_shared__",
      "feather",
      "google_llp",
      "googletag",
      "GoogleGcLKhOms",
      "google_image_requests",
      "jQuery19108826912945961212",
    ],
    addInfoBanner: [
      { targetElement: ".download_box > a", where: "afterend" },
      { targetElement: "form > .container > .row", where: "beforeend" },
    ],
    modifyButtons: [
      ["button#method_free"],
      ["#downloadbtn", { requiresCaptcha: true }],
      ["a.btn-block"],
    ],
    customScript() {
      // click the "Slow Download" option on page 1
      // this.$("button#method_free")?.click();
      this.$(".col-md-4")?.classList.replace("col-md-4", "col-md-12");
      this.$("p.mb-5")?.classList.remove("mb-5");

      // style page for convenience
      this.ifElementExists("div.download_box img", () => {
        this.$("div.download_box").insertAdjacentHTML(
          "afterbegin",
          '<div class="input-group mb-3"></div><div class="input-group-prepend text-center"></div><span class="input-group-text font-weight-bold">Captcha Code </span>'
        );
        this.$("div.download_box span.input-group-text").appendChild(
          this.$("input.captcha_code")
        );
        this.$("input.captcha_code")?.classList.add("form-control");
        this.$("div.download_box").insertAdjacentElement(
          "afterbegin",
          this.$("img")
        );

        // Make the remaining elements neat
        this.$(".download_box")?.classList.add("container");
        this.$$("img").forEach((e) => {
          if (/captcha/gi.test(e.src)) {
            e.style.height = "8em";
            e.style.width = "auto";
          }
        });
      });
    },
  },
  dropgalaxy: {
    host: [
      "dropgalaxy.com",
      "dropgalaxy.in",
      "techssting.com",
      "techyneed.com",
      "financemonk.net",
    ],
    customStyle: `html,body,#container,.bg-white{background:#121212!important;color:#dfdfdf!important}.download_box,.fileInfo{background-color:#323232!important}ins,#badip,#vi-smartbanner,.adsBox,vli,div[style*='2147483650'],#modalpop,#overlaypop{display:none!important}body{padding-bottom:unset!important}`, // body > div:not([class])
    downloadPageCheckBySelector: ["button[name='method_free']", "a#dl"],
    downloadPageCheckByRegex: [
      /Click here to download/gi,
      /This direct link will be available for/gi,
      /Create download link/gi,
    ],
    remove: [
      "nav",
      "footer",
      ".sharetabs ul",
      "#load img",
      "ul#article",
      "br",
      "button[name='method_premium']",
      ".adsBox",
      "#vi-smartbanner",
    ],
    removeByRegex: [
      { query: ".download_method", regex: /fast download/gi },
      { query: ".row.pt-4.pb-5", regex: /307200/gi },
      { query: "ul", regex: /What is DropGalaxy?/gi },
      { query: "div.mt-5.text-center", regex: /ad-free/gi },
    ],
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "__CF$cv$params",
      "absda",
      "adsbygoogle",
      "_0xab85",
      "_0x4830",
      "_0x1d5c98",
      "_0x20de87",
      "_0x3b510c",
      "_0x23aaed",
      "_0x71ffdf",
      "_0x16b49f",
      "_0x167e3f",
      "_0x695d81",
      "_0x3fa68e",
      "isDesktop",
      "ip",
      "AaDetector",
      "LieDetector",
      "__cfBeacon",
      "removeURLParameter",
      "getParameterByName",
      "updateQueryStringParameter",
      "setPagination",
      "colortheme",
      "color",
      "LAST_CORRECT_EVENT_TIME",
      "_603968549",
      "_1714636353",
      "F5NN",
      "I833",
      "DEBUG_MODE",
      "ENABLE_LOGS",
      "ENABLE_ONLINE_DEBUGGER",
      "SUPPORT_IE8",
      "MOBILE_VERSION",
      "EXTERNAL_POLYFILL",
      "SEND_PIXELS",
      "IS_POP_COIN",
      "PIXEL_LOG_LEVEL_INFO",
      "PIXEL_LOG_LEVEL_DEBUG",
      "PIXEL_LOG_LEVEL_WARNING",
      "PIXEL_LOG_LEVEL_ERROR",
      "PIXEL_LOG_LEVEL_METRICS",
      "p5NN",
      "S5NN",
      "L5NN",
      "_392594680",
      "_pop",
      "_0x16f7",
      "_0x2768",
      "_0x2f1ac4",
      "_0x4eaee9",
      "_0x51da65",
      "_0x4e2ddc",
      "_0x4cc079",
      "_0x5e084c",
      "vitag",
      "linksucess",
      // "go", // Page uses this function to navigate to disguised url
      "delComment",
      "player_start",
      "pplayer",
      "showFullScreen",
      "_0x2bb9",
      "_0x77be",
      "_0x8f9e7e",
      "_0x577d04",
      "_0x2237cb",
      "_0x11947",
      "_0x41b9e0",
      "_0x9a9b21",
      "_VLIOBJ",
      "fanfilnfjkdsabfhjdsbfkljsvmjhdfb",
      "iinf",
      "detectZoom",
      "iframe",
      "where",
      "win",
      "_pao",
      "regeneratorRuntime",
      "__core-js_shared__",
      "tagApi",
      "viAPItag",
      "observeElementInViewport",
      "jQuery19108284913344818186",
      "colors",
      "setStyleSheet",
      "changecolor",
      "ClipboardJS",
      "links",
      "vlipbChunk",
      "vlipb",
      "_pbjsGlobals",
      "nobidVersion",
      "nobid",
      "vlPlayer",
      "googletag",
      "ggeac",
      "google_js_reporting_queue",
      "$sf",
      "_google_rum_ns_",
      "google_persistent_state_async",
      "google_global_correlator",
      "google_srt",
      "mb",
      "Goog_AdSense_Lidar_sendVastEvent",
      "Goog_AdSense_Lidar_getViewability",
      "Goog_AdSense_Lidar_getUrlSignalsArray",
      "Goog_AdSense_Lidar_getUrlSignalsList",
      "module$contents$ima$CompanionAdSelectionSettings_CompanionAdSelectionSettings",
      "ima",
      "module$contents$ima$AdsRenderingSettings_AdsRenderingSettings",
      "module$contents$ima$AdCuePoints_AdCuePoints",
      "module$contents$ima$AdError_AdError",
      "module$contents$ima$AdErrorEvent_AdErrorEvent",
      "module$contents$ima$AdEvent_AdEvent",
      "module$contents$ima$AdsManagerLoadedEvent_AdsManagerLoadedEvent",
      "google",
      "$jscomp",
      "$jscomp$lookupPolyfilledValue",
      "AdscoreInit",
      "pako",
      "txt",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_measure_js_timing",
      "goog_pvsid",
      "timeout",
      "a",
      "refS",
    ],
    addInfoBanner: [
      {
        targetElement: ".container.page.downloadPage .row",
        where: "beforeend",
      },
    ],
    modifyButtons: [
      ["button[name='method_free']"],
      [
        "button#downloadBtnClick",
        {
          makeListener: true,
          requiresTimer: true,
          props: { onclick: "", style: "" },
        },
      ],
      // [
      //   "div.container.page.downloadPage > div > div.col-md-4 > a",
      //   {
      //     replaceWithForm: true,
      //     props: { onclick: "", style: "" },
      //   },
      // ],
      [
        "button#dl",
        {
          props: { onclick: "", style: "" },
        },
      ],
    ],
    createCountdown: { timer: 10, element: ".seconds" },
    customScript() {
      this.$("body").classList.remove("white");
      this.$("body").classList.add("dark");
      this.window?.["setStyleSheet"]?.(
        "https://dropgalaxy.com/assets/styles/dark.min.css"
      );
      if (
        /proxy not allowed/gi.test(
          this.$("center div.alert.alert-danger.mb-3")?.textContent
        )
      ) {
        this.log("Site does not like your IP address, stopping script");
        return;
      }
      this.$$(".col-md-4").forEach((e) =>
        e.classList.replace("col-md-4", "col-12")
      );

      // if (this.$("#xd")) {
      //   this.$("#downloadhash")?.setAttribute("value", "0");
      //   this.$("#dropgalaxyisbest")?.setAttribute("value", "0");
      //   this.$("#adblock_check")?.setAttribute("value", "0");
      //   this.$("#adblock_detected")?.setAttribute("value", "1");
      //   this.$("#admaven_popup")?.setAttribute("value", "1");
      // }

      this.interceptAJAX(function (args) {
        const ajaxOptions = arguments?.[0];
        if (ajaxOptions?.url?.match(/userusage/gi)) {
          return false;
        }
        if (
          ajaxOptions?.url?.search("https://tmp.dropgalaxy.in/gettoken.php") >
          -1
        ) {
          function overallDecoder(message) {
            const decoded = message
              .replace(/004|005|007/g, (res) => {
                return { "004": "2", "005": "3", "007": "7" }[res];
              })
              .split(",");
            return decoded
              .map((d) => String.fromCharCode(parseInt(d)))
              .join("");
          }

          function overallEncoder(str) {
            let buf = new ArrayBuffer(str.length * 2);
            let bufView = new Uint8Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
              bufView[i] = str.charCodeAt(i);
            }
            encoded_string = buf;

            // var encoded_string = encoder(coded_string);
            const uint8array_of_encoded_string = new Uint8Array(encoded_string);
            const encoded_message = uint8array_of_encoded_string
              .toString()
              .replace(/2|3|7|,0,0,0/g, (res) => {
                return { 2: "004", 3: "005", 7: "007", ",0,0,0": "" }[res];
              });
            return encoded_message;
          }

          const payload = new URLSearchParams(ajaxOptions.data).get("msg");
          let moddedPayload = overallDecoder(payload);
          // moddedPayload = moddedPayload.replace(/(id=)([^\]]+)/, "$1")
          moddedPayload += `<ins class="adsbygoogle adsbygoogle-noablate" data-adsbygoogle-status="done" style="display: none !important;" data-ad-status="unfilled"><ins id="aswift_0_expand" tabindex="0" title="Advertisement" aria-label="Advertisement" style="border: none; height: 0px; width: 0px; margin: 0px; padding: 0px; position: relative; visibility: visible; background-color: transparent; display: inline-table;"><ins id="aswift_0_anchor" style="border: none; height: 0px; width: 0px; margin: 0px; padding: 0px; position: relative; visibility: visible; background-color: transparent; display: block;"><iframe id="aswift_0" name="aswift_0" style="left:0;position:absolute;top:0;border:0;width:undefinedpx;height:undefinedpx;" sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation" frameborder="0" src="https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-6572127804953403&amp;output=html&amp;adk=1812271804&amp;adf=3025194257&amp;lmt=1632852274&amp;plat=1%3A16777216%2C2%3A16777216%2C3%3A32%2C4%3A32%2C9%3A32776%2C16%3A8388608%2C17%3A32%2C24%3A32%2C25%3A32%2C30%3A1081344%2C32%3A32&amp;format=0x0&amp;url=https%3A%2F%2Ffinancemonk.net%2F&amp;ea=0&amp;flash=0&amp;pra=5&amp;wgl=1&amp;uach=WyJXaW5kb3dzIiwiMTAuMC4wIiwieDg2IiwiIiwiOTQuMC45OTIuMzEiLFtdLG51bGwsbnVsbCwiNjQiXQ..&amp;dt=1632852274664&amp;bpp=2&amp;bdt=3967&amp;idt=133&amp;shv=r20210922&amp;mjsv=m202109220101&amp;ptt=9&amp;saldr=aa&amp;abxe=1&amp;nras=1&amp;correlator=2805760161265&amp;frm=20&amp;pv=2&amp;ga_vid=1157668643.1632852275&amp;ga_sid=1632852275&amp;ga_hid=11092835&amp;ga_fc=0&amp;u_tz=-300&amp;u_his=6&amp;u_h=1080&amp;u_w=1920&amp;u_ah=1040&amp;u_aw=1920&amp;u_cd=24&amp;adx=-12245933&amp;ady=-12245933&amp;biw=1903&amp;bih=969&amp;scr_x=0&amp;scr_y=0&amp;eid=31062309%2C31062430%2C31062311&amp;oid=3&amp;pvsid=4370036607835633&amp;pem=719&amp;wsm=1&amp;ref=https%3A%2F%2Fwww.google.com%2F&amp;eae=2&amp;fc=1920&amp;brdim=-1920%2C122%2C-1920%2C122%2C1920%2C122%2C1920%2C1040%2C1920%2C969&amp;vis=1&amp;rsz=%7C%7Cs%7C&amp;abl=NS&amp;fu=32768&amp;bc=31&amp;ifi=1&amp;uci=a!1&amp;fsb=1&amp;dtd=152" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" data-google-container-id="a!1" data-load-complete="true"></iframe></ins></ins></ins>[scr=https://www.googletagservices.com/activeview/js/current/osd.js][scr=https://partner.googleadservices.com/gampad/cookie.js?domain=financemonk.net&callback=_gfp_s_&client=ca-pub-6572127804953403][scr=https://pagead2.googlesyndication.com/pagead/managed/js/adsense/m202109220101/show_ads_impl.js][scr=https://static.cloudflareinsights.com/beacon.min.js][scr=https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js][scr=/cdn-cgi/challenge-platform/h/b/scripts/invisible.js][scr=//salutationcheerlessdemote.com/sfp.js][scr=https://adservice.google.com/adsid/integrator.js?domain=financemonk.net][scr=//housewifehaunted.com/4f/b9/d6/4fb9d6755e5818e2fb1ce2f1b6bbd2a5.js][scr=https://tmp.dropgalaxy.in/adspopup.js][scr=https://tmp.dropgalaxy.in/adddds.js?v=1.0]`;

          console.log(moddedPayload);
          const data = {rand:"", msg:overallEncoder(moddedPayload)}
          console.log(data);
          // console.log(
          //   overallDecoder(new URLSearchParams(ajaxOptions.data).get("msg"))
          // );
          // data capture from a request made from a browser with no Ad-Blockers
          // site then thinks its legit so it works
          const data2 = `rand=&msg=91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C005004%2C9007%2C100%2C10005%2C11007%2C9007%2C114%2C100%2C005004%2C11007%2C110%2C108%2C111%2C99%2C10007%2C101%2C100%2C005004%2C118%2C101%2C114%2C115%2C105%2C111%2C110%2C9005%2C91%2C114%2C9007%2C110%2C100%2C61%2C9005%2C91%2C105%2C100%2C61%2C10005%2C5004%2C119%2C106%2C116%2C10005%2C10005%2C10041%2C5007%2C10040%2C5005%2C100%2C9005%2C91%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C105%2C115%2C98%2C101%2C115%2C116%2C61%2C48%2C9005%2C91%2C9007%2C100%2C98%2C108%2C111%2C99%2C10007%2C95%2C100%2C101%2C116%2C101%2C99%2C116%2C101%2C100%2C61%2C49%2C9005%2C91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C104%2C9007%2C115%2C104%2C61%2C49%2C9005%2C91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C104%2C9007%2C115%2C104%2C9007%2C100%2C61%2C11007%2C110%2C100%2C101%2C10004%2C105%2C110%2C101%2C100%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C119%2C119%2C119%2C46%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C116%2C9007%2C98%2C108%2C101%2C116%2C111%2C11004%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C115%2C116%2C9007%2C116%2C105%2C99%2C46%2C99%2C108%2C111%2C11007%2C100%2C10004%2C108%2C9007%2C114%2C101%2C105%2C110%2C115%2C105%2C10005%2C104%2C116%2C115%2C46%2C99%2C111%2C109%2C4007%2C98%2C101%2C9007%2C99%2C111%2C110%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C116%2C9007%2C10005%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C118%2C49%2C4007%2C49%2C54%2C51%2C49%2C5005%2C48%2C5005%2C55%2C56%2C5007%2C4007%2C56%2C5005%2C99%2C55%2C50%2C5005%2C100%2C55%2C5004%2C99%2C50%2C5007%2C54%2C10004%2C10004%2C5007%2C54%2C100%2C48%2C48%2C55%2C10004%2C5004%2C99%2C51%2C56%2C9007%2C9007%2C50%2C54%2C51%2C54%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C9007%2C115%2C115%2C101%2C116%2C115%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C11004%2C114%2C101%2C98%2C105%2C100%2C4007%2C100%2C101%2C10004%2C9007%2C11007%2C108%2C116%2C4007%2C11004%2C114%2C101%2C98%2C105%2C100%2C45%2C118%2C5005%2C46%2C49%2C50%2C46%2C48%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C119%2C119%2C119%2C46%2C10005%2C111%2C111%2C10005%2C108%2C101%2C116%2C9007%2C10005%2C115%2C101%2C114%2C118%2C105%2C99%2C101%2C115%2C46%2C99%2C111%2C109%2C4007%2C116%2C9007%2C10005%2C4007%2C106%2C115%2C4007%2C10005%2C11004%2C116%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C105%2C109%2C9007%2C115%2C100%2C10007%2C46%2C10005%2C111%2C111%2C10005%2C108%2C101%2C9007%2C11004%2C105%2C115%2C46%2C99%2C111%2C109%2C4007%2C106%2C115%2C4007%2C115%2C100%2C10007%2C108%2C111%2C9007%2C100%2C101%2C114%2C4007%2C105%2C109%2C9007%2C51%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C9007%2C115%2C115%2C101%2C116%2C115%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C11004%2C108%2C11007%2C10005%2C105%2C110%2C115%2C4007%2C115%2C9007%2C10004%2C101%2C10004%2C114%2C9007%2C109%2C101%2C4007%2C115%2C114%2C99%2C4007%2C106%2C115%2C4007%2C115%2C10004%2C95%2C104%2C111%2C115%2C116%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C115%2C101%2C99%2C11007%2C114%2C101%2C11004%2C11007%2C98%2C9007%2C100%2C115%2C46%2C10005%2C46%2C100%2C111%2C11007%2C98%2C108%2C101%2C99%2C108%2C105%2C99%2C10007%2C46%2C110%2C101%2C116%2C4007%2C10005%2C11004%2C116%2C4007%2C11004%2C11007%2C98%2C9007%2C100%2C115%2C95%2C105%2C109%2C11004%2C108%2C95%2C50%2C48%2C50%2C49%2C48%2C5007%2C48%2C55%2C48%2C49%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C100%2C11005%2C48%2C54%2C11007%2C5007%2C108%2C116%2C5005%2C9007%2C10007%2C114%2C50%2C46%2C99%2C108%2C111%2C11007%2C100%2C10004%2C114%2C111%2C110%2C116%2C46%2C110%2C101%2C116%2C4007%2C0076%2C99%2C8007%2C8004%2C108%2C90%2C10007%2C8004%2C0079%2C69%2C65%2C119%2C6007%2C101%2C85%2C104%2C86%2C85%2C86%2C5005%2C51%2C8004%2C119%2C005007%2C51%2C68%2C005007%2C51%2C68%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C99%2C46%2C9007%2C100%2C115%2C99%2C111%2C46%2C114%2C101%2C4007%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C108%2C8005%2C0079%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C84%2C54%2C8007%2C84%2C65%2C0070%2C104%2C80%2C115%2C45%2C86%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C0071%2C90%2C104%2C50%2C51%2C10041%2C10040%2C106%2C56%2C10007%2C81%2C10007%2C84%2C48%2C0078%2C85%2C8005%2C84%2C0071%2C007007%2C5004%2C51%2C105%2C66%2C51%2C95%2C0070%2C007004%2C11007%2C95%2C65%2C55%2C99%2C9007%2C11004%2C0071%2C0076%2C5004%2C98%2C99%2C99%2C10007%2C81%2C119%2C81%2C66%2C0071%2C007007%2C69%2C81%2C6007%2C007005%2C65%2C11005%2C118%2C110%2C68%2C98%2C115%2C9007%2C56%2C10004%2C0078%2C104%2C84%2C115%2C0079%2C48%2C51%2C0075%2C116%2C99%2C116%2C111%2C10007%2C10005%2C007005%2C007004%2C0078%2C1004004%2C11004%2C11007%2C54%2C100%2C0070%2C89%2C68%2C007007%2C84%2C0076%2C66%2C9007%2C119%2C99%2C0079%2C65%2C105%2C65%2C10041%2C007007%2C95%2C56%2C5007%2C0070%2C007004%2C51%2C9007%2C10005%2C6007%2C007007%2C0079%2C86%2C101%2C110%2C5005%2C10005%2C114%2C10005%2C9007%2C007004%2C65%2C8007%2C99%2C45%2C0074%2C0074%2C10041%2C0076%2C50%2C10005%2C109%2C6007%2C86%2C1004004%2C114%2C007004%2C104%2C88%2C116%2C66%2C10005%2C0058%2C118%2C61%2C5004%2C0058%2C90%2C110%2C8004%2C10005%2C69%2C84%2C10040%2C007005%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C101%2C11004%2C99%2C104%2C8007%2C0078%2C11005%2C0074%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C114%2C109%2C0075%2C106%2C110%2C115%2C007004%2C0079%2C61%2C0058%2C66%2C0070%2C0074%2C007004%2C007007%2C115%2C116%2C10007%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C56%2C50%2C55%2C45%2C119%2C104%2C9007%2C116%2C45%2C105%2C115%2C45%2C105%2C110%2C115%2C11007%2C114%2C9007%2C110%2C99%2C101%2C45%2C99%2C111%2C118%2C101%2C114%2C9007%2C10005%2C101%2C46%2C104%2C116%2C109%2C108%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C0`;
          ajaxOptions.data = data;
        }
        return true;
      });
    },
  },
  fileupload: {
    host: ["file-up.org", "file-upload.com"],
    customStyle: `html,body,.row,.stdt,.dareaname,section.page-content,div.page-wrap{background:#121212!important;color:#dfdfdf!important;
      font-size:16px!important;}#downloadbtn{padding:20px 50px!important}a#download-btn{padding:20px 50px!important}.row.comparison-row,form[name='F1'] #dl_btn_container,#fb-root{display:none!important}form[name='F1']{display:flex!important;flex-direction:column!important;}.seconds{padding:12px!important;width:unset!important;height:unset!important;line-height:unset!important;font-size:32px!important}`,
    downloadPageCheckBySelector: [
      "input[name='method_free']",
      "button#downloadbtn",
      "div.download_box",
    ],
    downloadPageCheckByRegex: [
      /you have requested/gi,
      /captcha box to proceed/gi,
      /File Download Link Generated/gi,
    ],
    remove: [
      "header",
      ".breaking-news",
      "#fb-root",
      ".page-buffer",
      ".abtlikebox",
      ".scrollToTop",
      "footer",
      "h1.default-ttl",
      "#adblockinfo",
      ".adsbox",
      "#bannerad",
      "#fb-root",
      "#ads_container_4",
      "div.leftcol > div.row",
      "div#ads_container_1 div.leftcol",
      "hr",
      "form tr:nth-child(n+4)",
      ".row .col-xs-12.col-sm-12.col-md-8.col-lg-8.col-md-offset-2 .blocktxt",
      ".antivirus",
      ".row.comparison-row",
      "input[name='method_premium']",
    ],
    removeByRegex: [
      { query: "div.row", regex: /about file upload/gi },
      { query: "center", regex: /ads/gi },
      { query: ".container > .page-wrap > .text-center", regex: /ads/gi },
      { query: "form .row", regex: /VirusTotal scan/gi },
    ],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      // "__rocketLoaderEventCtor",
      // "__rocketLoaderLoadProgressSimulator",
      "__cfQR",
      "zfgformats",
      "wios5zt2ze",
      "onClickTrigger",
      "zfgloadedpopup",
      "ppuWasShownFor4244463",
      "sdk",
      "installOnFly",
      "webpushlogs",
      "initIPP",
      "zfgloadedpush",
      "zfgloadedpushopt",
      "zfgloadedpushcode",
      "html5",
      "Modernizr",
      "yepnope",
      "CBPFWTabs",
      "setPagination",
      "WOW",
      "eve",
      "mina",
      "Snap",
      "adsbox",
      "downloadbtn",
      "delComment",
      "player_start",
      "nr",
      "btn_cont",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "_atrk_opts",
      "_gaq",
      "__cfRLUnblockHandlers",
      "closure_lm_965213",
      "_gat",
      "FB",
      "onClickExcludes",
    ],
    finalDownloadElementSelector: [["#download-div > a#download-btn"]],
    addHoverAbility: [],
    addInfoBanner: [],
    createCountdown: { element: ".seconds" },
    customScript() {
      // click the "Free Download" option on page 1
      this.waitUntilSelector("input[name='method_free']").then((btn) => {
        btn?.removeAttribute("onclick");
        btn?.click();
      });
      this.waitUntilSelector("form[name='F1']").then((form) => {
        this.addCustomCSSStyle(
          `.ss-btn{background-color:#44c767;border-radius:28px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#fff;font-family:Arial;font-size:17px;font-weight:700;padding:12px 64px;text-decoration:none;text-shadow:0 1px 0 #2f6627}.ss-btn:hover{background-color:#5cbf2a}.ss-btn:active{position:relative;top:1px}`
        );
        form.insertAdjacentHTML(
          "beforeend",
          `<button type="submit" value="Submit" class="ss-btn">Create Download Link</button>`
        );
        this.addInfoBanner({ targetElement: ".ss-btn", where: "afterend" });
        this.addHoverAbility([".ss-btn"], true);
      });

      // add listener with delay due to issues
      this.waitUntilGlobalVariable("grecaptcha").then(() => {
        this.addCaptchaListener(
          document.F1,
          +document.querySelector(".seconds").innerText || 30
        );
      });

      // Last page, remove malicious script
      this.waitUntilSelector("#download-div > a#download-btn").then((btn) => {
        btn.removeAttribute("onclick");
        const dl_link = btn.getAttribute("href");
        const parent = btn.parentElement;
        this.addCustomCSSStyle(
          `.ss-btn{background-color:#44c767;border-radius:28px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#fff;font-family:Arial;font-size:17px;font-weight:700;padding:12px 64px;text-decoration:none;text-shadow:0 1px 0 #2f6627}.ss-btn:hover{background-color:#5cbf2a}.ss-btn:active{position:relative;top:1px}`
        );
        parent.innerHTML = `<a class="ss-btn" href="${dl_link}">Download</button>`;
        this.addInfoBanner({ targetElement: ".ss-btn", where: "afterend" });
        this.origSetTimeout(() => {
          this.addHoverAbility([".ss-btn"], false);
        }, 1000);
      });
    },
  },
  "up-load.io": {
    host: ["up-load.io"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}div.filepanel.lft,div.info,.dfilename{background:#212121!important;color:#dfdfdf!important}#downloadbtn{padding:20px 50px!important}.dfile .report,#s65c,body > span,#comments{display:none!important}#container > div > li{color:#121212}.fileInfo .download-button{width:unset;vertical-align:unset;line-height:unset;}.fileInfo,.seconds{background:#212121!important;}`,
    downloadPageCheckBySelector: [
      "input[name='method_free']",
      "button#downloadbtn",
      "div.download-button > a.btn.btn-dow",
    ],
    downloadPageCheckByRegex: [/create your link/gi, /for your IP next 24/gi],
    remove: [
      "#gdpr-cookie-notice",
      "nav",
      "footer",
      ".footer-sub",
      "form[name='F1'] a[href*='premium']",
      "input[name='method_premium']",
      "br",
      "div[align='left'] > li",
      "#container > div > li > div.col-md-12.pt20 > center:nth-child(2) > center",
      "[id*='adpays']",
      "body > span",
      "#container > div.container.download_page.pt30 > div > div.col-md-8",
      "#commonId > a",
      "div.filepanel.lft > div.share",
      "#container > div > div.col-md-12.text-center > form > div",
      "#container > div > div.col-md-12.pt20 > center > center",
      "#container > div > div > div.container.download_page.pt30 > div > div.col-md-8 li",
      ".ads",
    ],
    removeByRegex: [{ query: "style", regex: /#s65c ~ \*/gi }],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "gtag",
      "dataLayer",
      "adsbygoogle",
      "setPagination",
      "k",
      "_fads8ba2j8",
      "d8c1u8ijebf",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_qxifk",
      "_gozxvbj",
      "google_tag_manager",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "_0x173b",
      "_0x2697",
      "LieDetector",
      "atAsyncContainers",
      "delComment",
      "player_start",
      "showFullScreen",
      "_srort75geef",
      "_tjnfie",
      "_rufpns",
      "s65c",
      "ClipboardJS",
      "core",
      "__core-js_shared__",
      "feather",
      "cookiesAgree",
      "cStart",
      "cEnd",
      "aPPUReinitialization",
      "sdk",
      "closure_lm_401245",
      "installOnFly",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "zfgloadedpush",
      "zfgloadedpushopt",
      "zfgloadedpushcode",
      "atOptions",
      "_0x28f6",
      "_0x3693",
      "_0x196a1559e34586fdb",
      "01rt97ea5ojs",
      "_Hasync",
      "a",
      "b",
      "network",
      "_0xc3bd",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_user_agent_client_hint",
      "biz",
      "random",
      "referr",
      "chfh",
      "chfh2",
      "_HST_cntval",
      "Histats",
      "node",
      "LAST_CORRECT_EVENT_TIME",
      "_3399814740",
      "___FONT_AWESOME___",
      "FontAwesomeConfig",
      "FontAwesome",
      "_HistatsCounterGraphics_0_setValues",
      "adcode_count",
      "post_sticky_handler",
      "post_noads_handler",
      "post_trackdata_handler",
      "post_skin_handler",
      "post_expandable_handler",
      "post_pop_handler",
      "post_interstitial_handler",
      "post_native_handler",
      "native_resize_handler",
      "post_iframe_handler",
      "ItemDataScript_parameter",
      "ItemDataScript_parameter_new",
      "ItemDataScript_parameter_seperate",
      "aduid",
      "pid",
      "width",
      "height",
      "displaytype",
      "responsive",
      "block_id",
      "adSectionWidth",
      "page_meta_data",
      "page_title",
      "page_referrer",
      "meta_description",
      "meta_keywords",
      "search_keywords",
      "currently_rendered",
      "currently_rendered_flag",
      "currently_rendered_adunit",
      "cpc_impression",
      "cpm_impression",
      "cpa_impression",
      "cpd_impression",
      "cpv_impression",
      "html_impression",
      "ret",
      "iframe_src",
      "iinf",
      "cv",
      "char",
      "Tynt",
      "_dtspv",
      "__connect",
      "_33Across",
      "__uspapi",
      "__underground",
      "vglnk",
      "__v5k",
      "vl_cB",
      "vl_disable",
      "vglnk_16317554785726",
      "vglnk_16317554785737",
      "s",
      "urlorigin",
      "responsedata",
      "cookie_content_value",
      "cookie_content_data",
    ],
    finalDownloadElementSelector: [["div.download-button > a.btn.btn-dow"]],
    addHoverAbility: [
      ["button#downloadbtn", true],
      ["div.download-button > a.btn.btn-dow", false],
    ],
    addInfoBanner: [
      { targetElement: "#container > div.container", where: "afterend" },
    ],
    modifyButtons: [
      [
        "input#method_free",
        {
          style: "",
          replaceWithTag: "button",
          customText: "Free Download",
          moveTo: { position: "beforeend", target: "form[action='']" },
        },
      ],
      [
        "button#downloadbtn",
        { style: "", makeListener: true, requiresCaptcha: true },
      ],
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      // click the "Free Download" option on page 1
      // this.$("input[name='method_free']")?.click();

      // add listener
      this.addCaptchaListener(
        document.F1,
        +this.$(".seconds")?.innerText || 30
      );
      this.waitUntilSelector(".download-button > a").then((btn) => {
        const parent = btn.parentElement;
        parent.replaceChild(
          this.makeSafeForm({ actionURL: btn.href, method: "GET" }),
          btn
        );
      });
    },
  },
  katflys: {
    host: ["short.katflys.com"],
    customStyle: `html,body,.box{background:#121212!important;color:#dfdfdf!important}#container > div > li{color:#121212}`,
    downloadPageCheckBySelector: ["form[name='F1']"],
    downloadPageCheckByRegex: [],
    remove: [
      "#gdpr-cookie-notice",
      "nav",
      "footer",
      ".footer-sub",
      "form[name='F1'] a[href*='premium']",
      "br",
      "div[align='left'] > li",
      "#container > div > li > div.col-md-12.pt20 > center:nth-child(2) > center",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [],
    createCountdown: {},
    modifyButtons: [
      [
        "input[name='go']",
        { style: "", replaceWithTag: "button", customText: "Free Download" },
      ],
    ],
    customScript() {
      // this.$(".ss-btn-ready")?.click();
    },
  },
  uploadrar: {
    host: ["uploadrar.com"],
    customStyle: `body{background:#121212!important;color:#dfdfdf!important}.blockpage{background:#121212!important;border:none!important;box-shadow:none!important}.title{color:#8277ec!important}.blockpage .desc span{color:#dfdfdf!important}.blockpage .desc p{color:#797979!important}`,
    downloadPageCheckBySelector: [
      "#downloadbtn",
      "input[name='method_free']",
      "#direct_link",
    ],
    downloadPageCheckByRegex: [
      /This direct link will be available for your IP next 24 hours/gi,
    ],
    remove: [
      "header",
      "#gdpr-cookie-notice",
      "footer",
      ".menufooter",
      "#footer2",
      "#news_last",
      ".fileoption ul",
      "input[name='method_premium']",
      ".sharefile",
      ".banner1",
      ".banner2",
      ".banner3",
      ".report",
      "a.btn.btn-info.btn-lg",
      ".adsbygoogle",
      "#countdown", // countdown doesn't matter
      "form > div > div.col-xs-12.col-sm-12.col-md-8.col-lg-8",
    ],
    removeByRegex: [{ query: ".txt", regex: /uploadrar|Cloud computing/gi }],
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "_gaq",
      "WOW",
      "_taboola",
      "_gat",
      "options",
      "lary",
      "addEventListener",
      "k",
      "adsbygoogle",
      "cookiesAgree",
      "zfgformats",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "google_user_agent_client_hint",
      "kAWgyOxXhTis",
      "vRowKfzUKP",
      "cIuqJzgWhJ",
      "JhOjFdIupR",
      "ZWTPEQZYhZ",
      "kRBeOhzLuY",
      "oAAUBciJwG",
      "CWSTRhNQZH",
      "c2",
      "c1",
      "I5XCBfeVDZKA",
      "RbntPCrNXp",
      "timeout",
      "relocate_home",
      "delComment",
      "player_start",
      "showFullScreen",
      "_gfp_a_",
    ],
    // finalDownloadElementSelector: [["#direct_link a"]],
    addInfoBanner: [],
    modifyButtons: [
      ["input[name='method_free']"],
      ["#downloadbtn", { props: { type: "submit" } }],
      ["#direct_link a", { replaceWithForm: true }],
    ],
    customScript() {
      this.ifElementExists(
        "form > div > div.col-xs-12.col-sm-12.col-md-4.col-lg-4",
        (div) => (div.className = "col-12")
      );
      // Automation
      // this.$("input[name='method_free']")?.click();
      this.$("#downloadbtn")?.click();
      // document.forms.F1?.submit();
    },
  },
  mega4up: {
    host: ["mega4up.com", "mega4up.org"],
    customStyle: `html{background:#121212!important}body,.list-group-item{background:#121212!important;color:#dfdfdf!important}.card,.icon,.label-group,.subpage-content{background:#121212!important}#___ytsubscribe_0{display:none!important}`,
    downloadPageCheckBySelector: [
      "input[name='mega_free']",
      "button#downloadbtn",
      "div.download-button > a.btn.btn-dow",
    ],
    downloadPageCheckByRegex: [
      /Normal download speed/gi,
      /Click here to download/gi,
      /for your IP next 24/gi,
    ],
    remove: [
      "header",
      "#backTop",
      ".app-footer",
      ".footer-copyright",
      "#gdpr-cookie-notice",
      "div.row.compare_table",
      "body > div.subpage-content > div > div.card.mb-4 > div.card-body.p-5 > div > div.col-xl-8 > div.my-3.d-none.d-md-block",
      "div.col-xl-8 > style",
      "body > div.subpage-content > div > div.card.mb-4 > div > div > div.col-xl-8 > div.row",
      "#___ytsubscribe_0",
      "div.my-3.text-center",
    ],
    removeByRegex: [
      {
        query: ".container div.card div.card-body",
        regex: /Mega4up is one of the best/gi,
      },
      {
        query:
          "body > div.subpage-content > div > div.card > div > div.row.mb-3",
        regex: /report abuse/gi,
      },
      {
        query:
          "body > div.subpage-content > div > div.card.mb-4 > div > div > div.col-xl-8",
        regex: /Download Link/gi,
      },
    ],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "_gaq",
      "adsbygoogle",
      "_gat",
      "WOW",
      "devHus",
      "APP",
      "wow",
      "setPagination",
      "cookiesAgree",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "delComment",
      "player_start",
      "showFullScreen",
      "closure_lm_27553",
      "gapi",
      "___jsl",
      "osapi",
      "gapix",
      "gadgets",
      "iframer",
      "__gapi_jstiming__",
      "shindig",
      "ToolbarApi",
      "iframes",
      "IframeBase",
      "Iframe",
      "IframeProxy",
      "IframeWindow",
      "closure_lm_720427",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_user_agent_client_hint",
    ],
    finalDownloadElementSelector: [["#direct_link > a"]],
    addHoverAbility: [
      ["button#downloadbtn", true],
      ["#direct_link > a", false],
    ],
    addInfoBanner: [
      { targetElement: "form[name='F1']" },
      { targetElement: "#direct_link" },
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      // click the "Free Download" option on page 1
      this.$("input[name='mega_free']")?.click();

      this.waitUntilSelector("#direct_link > a").then((btn) =>
        btn.removeAttribute("onclick")
      );

      // add listener
      this.addCaptchaListener(document.F1, +this.$(".seconds").innerText || 30);

      this.ifElementExists(
        "div.card.mb-4 > div.card-body > div.row > div.col-xl-4",
        () => {
          this.$(
            "div.card.mb-4 > div.card-body > div.row > div.col-xl-4"
          )?.classList.replace("col-xl-4", "col-xl-12");
        }
      );
    },
  },
  "userupload.in": {
    host: ["userupload.in"],
    customStyle: `body{background-color:#121212 !important}`,
    downloadPageCheckBySelector: ["#downloadbtn"],
    downloadPageCheckByRegex: [
      /Create download link/gi,
      /Click here to download/gi,
      /Download link generated/gi,
    ],
    remove: ["nav", "#st_gdpr_iframe", "#banner_ad", "footer", "div.report"],
    removeByRegex: [{ query: ".aboutFile", regex: /UserFree/gi }],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "_gaq",
      "timeout",
      "adsbygoogle",
      "__gcse",
      "delComment",
      "player_start",
      "_gat",
      "gaGlobal",
      "clipboard",
      "__rocketLoaderEventCtor",
      "__rocketLoaderLoadProgressSimulator",
      "__cfQR",
      "st",
      "__stdos__",
      "tpcCookiesEnableCheckingDone",
      "tpcCookiesEnabledStatus",
      "__sharethis__docReady",
      "__sharethis__",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_apltlad",
      "google_spfd",
      "google_lpabyc",
      "google_unique_id",
      "google_sv_map",
      "google_user_agent_client_hint",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "module$exports$cse$search",
      "module$exports$cse$CustomImageSearch",
      "module$exports$cse$CustomWebSearch",
      "google",
      "module$exports$cse$searchcontrol",
      "module$exports$cse$customsearchcontrol",
      "closure_lm_969024",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "googletag",
      "__AMP_LOG",
      "__AMP_ERRORS",
      "ampInaboxInitialized",
      "__AMP_MODE",
      "__AMP_REPORT_ERROR",
      "ampInaboxPositionObserver",
      "ampInaboxFrameOverlayManager",
      "AMP",
      "FuckAdBlock",
      "fuckAdBlock",
      "xcJQCflAmpis",
      "KkUCuxqIgh",
      "VABjXzYzJp",
      "WSpSwDLzQd",
      "nsJjjBITZC",
      "neMuFFBFgq",
      "rMwHazIJjv",
      "BGWRSzJxTu",
      "c2",
      "c1",
      "u4QPe94lDBw7",
      "cfVDoTdmsN",
      "adBlockDetected",
      "adBlockNotDetected",
      "checkAgain",
      "__cfRLUnblockHandlers",
      "closure_lm_187383",
      "GoogleGcLKhOms",
      "google_image_requests",
      "x",
      "spimg",
      "c",
      "d",
      "zk5mz489hep",
      "zfgformats",
      "onClickTrigger",
      "zfgloadedpopup",
      "ppuWasShownFor4194753",
    ],
    finalDownloadElementSelector: [
      ["form a[type='button']", /download now|userupload.in:183/gi],
    ],
    addHoverAbility: [["form a[type='button']"], ["button#downloadbtn"]],
    addInfoBanner: [
      { targetElement: "form[name='F1'] .row", where: "beforeend" },
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.addCaptchaListener(
        document.forms.F1,
        +this.$(".seconds").innerText || 5
      );
    },
  },
  "userupload.net": {
    host: ["userupload.net"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}.card,.icon,.label-group,.subpage-content{background:#121212!important}`,
    downloadPageCheckBySelector: ["button#downloadbtn"],
    downloadPageCheckByRegex: [
      /Create Download Link/gi,
      /available for your IP next 24 hours/gi,
    ],
    remove: [
      "#st_gdpr_iframe",
      "nav",
      "footer",
      ".aboutFile",
      ".adsbygoogle",
      "form div.report",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    finalDownloadElementSelector: [["form a.btn.btn-primary.btn-block"]],
    addHoverAbility: [
      ["button#downloadbtn", true],
      ["form a.btn.btn-primary.btn-block", false],
    ],
    addInfoBanner: [],
    customScript() {
      // add listener
      this.addCaptchaListener(document.F1);

      this.ifElementExists("form[name='F1']", () => {
        this.addInfoBanner({
          targetElement: this.$("form[name='F1']")?.parentElement,
        });
      });
    },
  },
  rapidgator: {
    host: ["rapidgator.net/file", "rapidgator.net/download/captcha"],
    customStyle: `html{background:#121212!important}body{background:#121212!important;background-color:#121212!important;color:#dfdfdf!important}.container,.overall,.wrap-main-block{background:#121212!important}`,
    downloadPageCheckBySelector: [],
    downloadPageCheckByRegex: [],
    remove: [
      ".header",
      ".footer",
      "#left_banner",
      "#right_banner",
      "#top_banner",
      "#copy",
      ".social_buttons",
      "div.clear",
      ".table-download table tr:nth-child(n+2)",
      ".captcha_info",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    finalDownloadElementSelector: [],
    addHoverAbility: [
      ["form#captchaform a.btn", true],
      ["a.link.act-link.btn-free", false],
      [
        "div.in div.download-ready div.btm div.box-download a.btn.btn-download",
        true,
      ],
    ],
    addInfoBanner: [],
    customScript() {
      // add listener
      this.addCaptchaListener(document.forms.captchaform);

      this.ifElementExists("form#captchaform", () => {
        this.addInfoBanner({
          targetElement: this.$("form#captchaform")?.parentElement,
        });
      });

      // the ending direct download link
      const ddlURL =
        document.body.textContent.match(
          /return \'(http[s]?:\/\/(.*)?download(.*)?)\'/
        )?.[1] ?? null;
      if (ddlURL) {
        this.log("DDL Link was found on this page.");
        this.openNative(ddlURL, "_self");
        this.log(`Opening DDL link for file: ${ddlURL}`);
      }
    },
  },
  katfile: {
    host: ["katfile.com"],
    customStyle: `html{background:#121212!important}body{background:#121212!important;background-color:#121212!important;color:#dfdfdf!important}#container,.wrapper{background:#121212!important}.panel{background:#212121!important}`,
    downloadPageCheckBySelector: ["#downloadbtn"],
    downloadPageCheckByRegex: [
      /reCAPTCHA is a/gi,
      /slow speed download/gi,
      /Delay between free downloads must/gi,
    ],
    remove: [
      "nav",
      "footer",
      "#dllinked2",
      "#adtrue_tag_21265",
      "#addToAccount",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "setPagination",
      "lng",
      "_gaq",
      "adtrue_tags",
      "pro_ad",
      "timeout",
      "pmauid",
      "pmawid",
      "fq",
      "captcha_click",
      "download_click",
      "arr",
      "count",
      "player_start",
      "closure_lm_946261",
      "_gat",
      "gaGlobal",
      "generateCb",
      "adtrue_time",
      "adtrue_cb",
      "adtrue_rtb",
      "f9HHHH",
      "H9HHHH",
      "BetterJsPop",
      "ByoB",
      "adblock",
      "q",
      "qs",
      "js_code",
      "k",
      "allElement",
    ],
    finalDownloadElementSelector: [["#dlink"]],
    addHoverAbility: undefined,
    addInfoBanner: [],
    customScript() {
      this.$("#freebtn")?.click();
      if (!window.grecaptcha) {
        this.$("#downloadbtn")?.click();
      }
      this.$("#dlink")?.click();

      // add listener
      this.addCaptchaListener(document.forms.F1);
    },
  },
  "upload-4ever": {
    host: [/^(?:https?:\/\/)?(?:www\.)?upload-4ever.com/, "upload-4ever.com"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}.firstOne,.adsbygoogle,ins{display:none!important;}.notFirstOne{display:block!important;}a#downLoadLinkButton{padding:25px;}`,
    downloadPageCheckBySelector: [
      "#downloadbtn",
      "#downLoadLinkButton",
      "input[name='method_free']",
    ],
    downloadPageCheckByRegex: [
      /You can upgrade your account to a Premium account/gi,
      /click here to download/gi,
    ],
    remove: ["nav", "#gdpr-cookie-notice", "footer"],
    removeByRegex: [
      {
        query: "div.col-sm-12.content-section.text-center.mb-5",
        regex: /upgrade your account to a Premium account/gi,
      },
    ],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "_gaq",
      "setPagination",
      "cookiesAgree",
      "adsbygoogle",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "delComment",
      "player_start",
      "showFullScreen",
      "_gat",
      "a0_0x433e",
      "a0_0x3d7e",
      "k",
      "_8kf8erm7a4v",
      "ufotwnsdohk",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_emizg",
      "_nqgrxy",
      "LAST_CORRECT_EVENT_TIME",
      "_3223917861",
      "_1534093544",
      "F5NN",
      "I833",
      "DEBUG_MODE",
      "ENABLE_LOGS",
      "ENABLE_ONLINE_DEBUGGER",
      "SUPPORT_IE8",
      "MOBILE_VERSION",
      "EXTERNAL_POLYFILL",
      "SEND_PIXELS",
      "IS_POP_COIN",
      "PIXEL_LOG_LEVEL_INFO",
      "PIXEL_LOG_LEVEL_DEBUG",
      "PIXEL_LOG_LEVEL_WARNING",
      "PIXEL_LOG_LEVEL_ERROR",
      "PIXEL_LOG_LEVEL_METRICS",
      "p5NN",
      "S5NN",
      "L5NN",
      "WOW",
      "_this",
      "__CF$cv$params",
      "closure_lm_781969",
      "fanfilnfjkdsabfhjdsbfkljsvmjhdfb",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "iinf",
      "webpushlogs",
      "initIPP",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [
      ["div.rightcol div#commonId button#downloadbtn", true],
      ["a#downLoadLinkButton", false],
    ],
    addInfoBanner: [
      { targetElement: "div.rightcol div#commonId", where: "beforeend" },
      { targetElement: "a#downLoadLinkButton", where: "afterend" },
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.ifElementExists("#downloadbtn", () => {
        this.$("#downloadbtn").classList.replace("btn-sm", "btn-lg");
      });

      // Automation
      this.$("input[name='method_free']")?.click();
      this.addCaptchaListener(document.forms.F1, 35);
      this.waitUntilSelector("#downLoadLinkButton").then((link) => {
        this.logDebug(link.getAttribute("onclick"));
        // Remove nasty ad redirect
        link.removeAttribute("onclick");
        link.setAttribute("href", link?.dataset.target);
        this.logNative(link?.dataset.target);
        if (link?.dataset.target) {
          this.log("DDL Link was found on this page.");
          // Open DDL for download
          this.openNative(link?.dataset.target, "_self");
          this.log("Opening DDL link for file.");
        }
      });
      this.waitUntilSelector("#downLoadLinkButton[onclick]").then((btn) => {
        this.log(btn.getAttribute("onclick"));
        btn.removeAttribute("onclick");
      });
    },
  },
  uploadev: {
    host: ["uploadev.org"],
    customStyle: `.mngez_messgepage,.mngez_download0,.mngez_download1,body{background:#121212!important;color:#dfdfdf!important}.mngez_download1 .capcha p{color:#dfdfdf!important}.mngez_download1 .fileinfo .colright .col1 p i{color:#dfdfdf!important}.mngez_download1 .fileinfo .colright .col1 span{color:#dfdfdf!important}.adsbygoogle{display:none!important}`,
    downloadPageCheckBySelector: [
      "input[name='method_free']",
      "#error_message",
      "#direct_link a.directl",
    ],
    downloadPageCheckByRegex: [
      /This direct link will be available for your IP/gi,
    ],
    remove: [
      "header",
      "#gdpr-cookie-notice",
      "footer",
      "#footer2",
      ".tableoffers .offerstxt",
      ".offersprim",
      "div.aboutuplouad",
      "div.sharetabs",
      ".fileinfo .col2",
      "form > center",
      ".adsbygoogle",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      // '__rocketLoaderEventCtor',
      // '__rocketLoaderLoadProgressSimulator',
      "__cfQR",
      "zfgformats",
      "sdk",
      "installOnFly",
      "jQuery1910939354703747453",
      "setPagination",
      "_gaq",
      "adsbygoogle",
      "timeleft",
      "downloadTimer",
      "openPage",
      "linkTo",
      "ww",
      "wh",
      "fixedSize",
      "openInNewTab",
      "popup",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_apltlad",
      "google_spfd",
      "google_lpabyc",
      "google_unique_id",
      "google_sv_map",
      "google_user_agent_client_hint",
      "cookiesAgree",
      "__cfRLUnblockHandlers",
      "_gat",
      "gaGlobal",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "GoogleGcLKhOms",
      "google_image_requests",
      "googletag",
      "11",
      "jQuery191039506225584719457",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "delComment",
      "player_start",
      "showFullScreen",
      "closure_lm_5496",
      "icup",
      "tim",
      "popurl",
      "_0yIlk3",
      "scripts",
      "myScript",
      "queryString",
      "params",
      "_wm",
      "urls",
      "random",
    ],
    finalDownloadElementSelector: [["#direct_link a.directl"]],
    addHoverAbility: [["#downloadbtn", true], ["#direct_link a.directl"]],
    addInfoBanner: [{ targetElement: ".mngez_download1", where: "beforeend" }],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.origSetTimeout(() => {
        this.waitUntilSelector("input[name='method_free']").then((btn) =>
          btn?.click()
        );
      }, 1000);
      // this page is slow for some reason so we have to delay
      this.waitUntilGlobalVariable("grecaptcha").then(() => {
        this.addCaptchaListener(document.forms.F1, 20);
      });
    },
  },
  apkadmin: {
    host: ["apkadmin.com"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}center{color:#dfdfdf!important}.download-page .file-info{background:#212121!important;color:#dfdfdf!important}`,
    downloadPageCheckBySelector: [
      "#downloadbtn",
      "div.container.download-page",
    ],
    downloadPageCheckByRegex: [
      /download should automatically begin in a few seconds/gi,
    ],
    remove: ["nav", ".sharetabs", "footer", "#features"],
    removeByRegex: [{ query: ".file-info", regex: /About APKadmin.com/gi }],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "__cfQR",
      "__core-js_shared__",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "process_643263",
      "setPagination",
      "googletag",
      "ggeac",
      "google_js_reporting_queue",
      "findCMP",
      "getRoxotGroupId",
      "getRoxotSectorId",
      "getRoxotDeep",
      "getRoxotEvent",
      "stpdPassback",
      "stpd",
      "stpdChunk",
      "_pbjsGlobals",
      "JSEncrypt",
      "ADAGIO",
      "nobidVersion",
      "nobid",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "atwpjp",
      "_atd",
      "_euc",
      "_duc",
      "_atc",
      "_atr",
      "addthis",
      "addthis_pub",
      "emdot",
      "_ate",
      "_adr",
      "addthis_conf",
      "addthis_open",
      "addthis_close",
      "addthis_sendto",
      "delComment",
      "player_start",
      "showFullScreen",
      "gtag",
      "dataLayer",
      "fullHeight",
      "__cfRLUnblockHandlers",
      "addthis_config",
      "addthis_share",
      "google_tag_manager",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_measure_js_timing",
      "goog_pvsid",
      "google_DisableInitialLoad",
      "apstag",
      "aax",
      "sas",
      "apntag",
      "_ADAGIO",
      "Criteo",
      "criteo_pubtag",
      "criteo_pubtag_prebid_112",
      "Criteo_prebid_112",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "__@@##MUH",
      "apstagLOADED",
      "_atw",
      "count",
      "addthis_exclude",
      "addthis_use_personalization",
      "addthis_options_default",
      "addthis_options_rank",
      "addthis_options",
      "__callbacks",
      "gaplugins",
      "gaGlobal",
      "gaData",
      "googleToken",
      "googleIMState",
      "processGoogleToken",
      "__google_ad_urls_id",
      "google_unique_id",
      "goog_sdr_l",
      "ampInaboxPositionObserver",
      "ampInaboxFrameOverlayManager",
      "GoogleGcLKhOms",
      "google_image_requests",
      "a0_0x433e",
      "a0_0x3d7e",
      "__CF$cv$params",
      "jQuery1910782106810384545",
      "google_rum_config",
      "google_srt",
      "_google_rum_ns_",
      "google_rum_values",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: undefined,
    addInfoBanner: [],
    customScript() {
      this.$("#downloadbtn")?.click();
    },
  },
  dlupload: {
    host: ["khabarbabal.online", "dlsharefile.com", "dlsharefile.org"],
    // customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}.bg-secondary,.bg-white,.card,.icon,.label-group,.subpage-content{background:#121212!important}#show-submit-btn,.border.bg-secondary .bg-white.border-0,.col-lg-12.text-center,.row.justify-content-center>a[href],.separator,.text-lg-center.btn-wrapper,center,h5.mb-0{display:none!important}.d-none{display:block!important}.h1,.h2,.h3,.h4,.h5,.h6,h1,h2,h3,h4,h5,h6{color:#dfdfdf!important}.container-1{unset:hidden!important}form#DownloadForm{display:flex;flex-direction:column;align-items:center}`,
    customStyle: `body,html{background:#121212!important;color:#dfdfdf!important}form#DownloadForm{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}`,
    downloadPageCheckBySelector: ["a.downloadb"],
    downloadPageCheckByRegex: [/free download/gi],
    remove: [
      "body > *",
      // "header",
      // "footer",
      // ".adsbygoogle",
      // "center",
      // ".shape.shape-style-1",
      // "div.separator.separator-bottom.separator-skew",
      // ".border.bg-secondary",
      // "br",
      // ".text-center > .row.justify-content-center > a",
    ],
    removeByRegex: [
      { query: ".row.mx-auto", regex: /DLUpload is a secure/gi },
      { query: ".col-lg-12.text-center", regex: /Safe & Secure/gi },
      {
        query: ".col-lg-12.text-center",
        regex: /wait for 14 seconds and click/gi,
      },
      { query: "div.card-header.border-0", regex: /Start Your /gi },
    ],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "ethereum",
      "gtag",
      "dataLayer",
      "adsbygoogle",
      "google_tag_manager",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_spfd",
      "google_unique_id",
      "google_sv_map",
      "google_lpabyc",
      "google_user_agent_client_hint",
      "google_tag_data",
      "gaGlobal",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "$insertQueue7cbd83f132f5$",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "RedirectCookies",
      "filename",
      "extension",
      "d",
      "urlsArray",
      "randomNumber",
      "currentImageUrl",
      "yxhpa",
      "yxhpb",
      "yxhpo",
      "yllixNetworkLoader",
      "Headroom",
      "process_430610",
      "_0x4ab4",
      "_0x4f3e",
      "sbslms",
      "process_430474",
      "closure_lm_259947",
      "onYouTubeIframeAPIReady",
      "$insert7cbd83f132f5$",
      "closure_lm_94135",
      "_0xa5ec",
      "_0x4b20",
      "_0x42f0b5",
      "mm",
      "rp",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "_0xa6ab",
      "_0x41de",
      "googletag",
      "GoogleGcLKhOms",
      "google_image_requests",
      "DownloadLink",
      "GotoLink",
      "_0x28f6",
      "_0x3693",
      "_0x196a1559e34586fdb",
      "ImpressionCookies",
      "d1",
      "urlsArray1",
      "randomNumber1",
      "currentImageUrl1",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [["#Submit", true]],
    addInfoBanner: [{ targetElement: "#DownloadForm", where: "beforeend" }],
    customScript() {
      // the magic cookie that allows the direct download
      this.document.cookie = `RedirectCookies=FilePage3;path=/`;
      // create custom form used to submit for direct download
      this.$("body").insertAdjacentHTML(
        "afterbegin",
        `<form id="DownloadForm" action="/Download/FilePage5" method="post">
      <input type="hidden" name="FileId" value="NmU1ZDRhOTYt">
      <button class="btn btn-lg btn-facebook" type="submit" id="Submit">Start Download</button>`
      );
      this.addHoverAbility(["#Submit"], true);
      this.addInfoBanner({
        targetElement: "#DownloadForm",
        where: "beforeend",
      });
      // manually create Google ReCAPTCHA for direct download
      this.createGoogleRecaptcha(
        "#DownloadForm",
        "6LdyluwUAAAAAI5AMDQTg4_9LFoNbrJub0IsdU3p",
        "afterbegin"
      );
      this.waitUntilGlobalVariable("grecaptcha").then(() => {
        this.addCaptchaListener("#DownloadForm", 0);
      });
      return;
      // rest of this was used before finding the workaround
      this.waitUntilSelector("a#downloadb").then((btn) => {
        btn?.click();
      });
      this.waitUntilSelector("#download-status").then((btn) => {
        $("#download-status").attr("id", "loading").text("Loading...");
        $("div#Download-Card").css("display", "none");
        $(".File-Info-Download").css("visibility", "visible");
      });
      this.waitUntilSelector("a#downloadbtn").then((btn) => {
        btn?.addEventListener(
          "click",
          function () {
            this.textContent = "Loading... Please Wait";
          },
          false
        );
        btn?.click();
      });
      this.waitUntilSelector("form#DownloadForm").then(() => {
        this.addCaptchaListener("form#DownloadForm").then(() => {
          this.$("#Submit")?.addEventListener(
            "click",
            function () {
              this.textContent = "Loading... Please Wait";
            },
            false
          );
          this.$("#Submit")?.click();
        });
      });
    },
  },
  file4: {
    host: ["file4.net"],
    customStyle: `html{background:#121212!important}.page-content,.portlet-body,.portlet.light,body{background:#121212!important;color:#dfdfdf!important}iframe[src*=ads]{display:none!important}input[name=sub],.div2 a[href^=down]{background-color:#008cba;border:none;color:#fff;padding:15px 32px;text-align:center;text-decoration:none;display:inline-block;font-size:16px}}`,
    downloadPageCheckBySelector: ["input[name='sub']", "a[href^='down']"],
    downloadPageCheckByRegex: [],
    remove: [
      ".page-header",
      ".page-head",
      ".page-content > .container > .row",
      ".page-prefooter",
      ".page-footer",
      "iframe[src*='ads']",
    ],
    removeByRegex: [{ query: ".row", regex: /What is file4net/gi }],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "Dropzone",
      "k",
      "_denv1fluxpv",
      "q13fpwg2dn",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_irsgkipt",
      "_zmlhugd",
      "s",
      "h6RR",
      "r1qq",
      "K6RR",
      "r6RR",
      "p6RR",
      "Cookies",
      "moment",
      "daterangepicker",
      "Morris",
      "eve",
      "Raphael",
      "AmCharts",
      "sample_data",
      "Datatable",
      "JSZip",
      // "_",
      "pdfMake",
      "ZeroClipboard_TableTools",
      "App",
      "Dashboard",
      "TableDatatablesManaged",
      "Layout",
      "Demo",
      "QuickSidebar",
      "closure_lm_166842",
      "LAST_CORRECT_EVENT_TIME",
      "_3512947627",
      "_766768431",
      "fa",
      "_1995723363",
      "post_sticky_handler",
      "post_noads_handler",
      "post_skin_handler",
      "post_expandable_handler",
      "post_pop_handler",
      "post_interstitial_handler",
      "post_native_handler",
      "native_resize_handler",
      "ItemDataScript_parameter",
      "ItemDataScript_parameter_new",
      "ItemDataScript_parameter_seperate",
      "aduid",
      "pid",
      "width",
      "height",
      "displaytype",
      "page_meta_data",
      "page_title",
      "page_referrer",
      "meta_description",
      "meta_keywords",
      "search_keywords",
      "currently_rendered",
      "currently_rendered_flag",
      "currently_rendered_adunit",
      "ret",
      "iframe_src",
      "q9tt",
      "J911",
      "n3hh",
      "P9tt",
      "G3hh",
      "m3hh",
      "U3hh",
      "i911",
      "N911",
      "Q911",
      "c2ss",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "urlorigin",
      "iinf",
      "zfgloadednative",
      "_retranberw",
      "webpushlogs",
      "initIPP",
      "regeneratorRuntime",
      "__core-js_shared__",
      "_retranber",
      "wm",
      "oaid",
      "ppuWasShownFor4187056",
      "_0x2efe",
      "_0x2200",
      "_nps",
      "nsto",
      "timeout",
      "interval",
      "threshold",
      "secondsleft",
      "sleepFor",
      "startChecking",
      "startschedule",
      "resetTimer",
      "_nne4hoafqlc",
      "zxwphqjzamr",
      "e",
      "x",
    ],
    finalDownloadElementSelector: [[".div2 a[href^='down']"]],
    addHoverAbility: [
      ["form[name='myform'] input[type='submit']", true],
      [".div2 a[href^='down']", false],
    ],
    addInfoBanner: [
      { targetElement: "form[name='myform']", where: "beforeend" },
      { targetElement: ".div2 a[href^='down']", where: "afterend" },
    ],
    customScript() {
      this.waitUntilGlobalVariable("grecaptcha").then(() => {
        const form = this.$("form[name='myform']");
        form.insertAdjacentHTML(
          "afterbegin",
          `<input type="hidden" name="sub" value="Continue">`
        );
        this.addCaptchaListener(form);
      });
      this.waitUntilSelector(".div1").then(
        (div) => (div.style.display = "none")
      );
      this.waitUntilSelector(".div2").then((div) => {
        div.style.display = "block";
        div.querySelector("a").removeAttribute("onclick");
      });
    },
  },
  dailyuploads: {
    host: ["dailyuploads.net"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}form[name=F1]{visibility:hidden}form[name=F1] table{visibility:visible}div.banner div.inner{display:flex;flex-direction:column;align-items:center}a[href*='.dailyuploads.net']:before{content:"Download"}a[href*='.dailyuploads.net'],#downloadBtnClickOrignal,.ss-btn{background-color:#44c767;border-radius:28px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#fff;font-family:Arial;font-size:17px;font-weight:700;padding:12px 64px;text-decoration:none;text-shadow:0 1px 0 #2f6627}a[href*='.dailyuploads.net']:hover,#downloadBtnClickOrignal:hover,.ss-btn:hover{background-color:#5cbf2a}a[href*='.dailyuploads.net'],#downloadBtnClickOrignal,.ss-btn:active{position:relative;top:1px}`,
    downloadPageCheckBySelector: [],
    downloadPageCheckByRegex: [
      /Download File/gi,
      /File Download Link Generated/gi,
      /direct link will be available/gi,
    ],
    remove: [
      ".navbar-inner",
      ".admin",
      ".footer",
      "table.file_slot",
      "label",
      "td[align='center'][width]",
      "a[href*='instagram']",
      "br",
      "a[title='online visitors']",
      "img[src*='redbutton.png']",
      "#addLinkBtn",
      "input[onclick]",
      "a:not([href*='dailyuploads'])",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "show_fname_chars",
      "upload_type",
      "form_action",
      "x",
      "y",
      "openStatusWindow",
      "StartUpload",
      "StartUploadBox",
      "checkExt",
      "checkSize",
      "getFileSize",
      "fixLength",
      "MultiSelector",
      "getFormAction",
      "setFormAction",
      "InitUploadSelector",
      "findPos",
      "changeUploadType",
      "jah",
      "submitCommentsForm",
      "scaleImg",
      "OpenWin",
      "player_start",
      "convertSize",
      "openlink",
      "checkForm",
      "tab_cookie",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "tabberOptions",
      "setCookie",
      "getCookie",
      "deleteCookie",
      "tabberObj",
      "tabberAutomatic",
      "tabberAutomaticOnLoad",
      "_Hasync",
      "_gaq",
      "curr",
      "old",
      "closure_lm_382233",
      "_gat",
      "gaGlobal",
      "gw2znwdsw05",
      "zfgformats",
      "onClickTrigger",
      "zfgloadedpopup",
      "chfh",
      "chfh2",
      "_HST_cntval",
      "Histats",
      "_HistatsCounterGraphics_0_setValues",
      "a",
      "cv",
      "Tynt",
      "_dtspv",
      "sdk",
      "installOnFly",
      "_33Across",
      "__uspapi",
      "zfgloadedpush",
      "zfgloadedpushopt",
      "zfgloadedpushcode",
      "__connect",
      "lotame_3825",
      "char",
      "lotameIsCompatible",
      "lt3825_ba",
      "lt3825_b",
      "lt3825_c",
      "lt3825_ca",
      "lt3825_d",
      "lt3825_e",
      "lt3825_da",
      "lt3825_ea",
      "lt3825_fa",
      "lt3825_",
      "lt3825_4",
      "lt3825_aa",
      "lt3825_a",
      "lt3825_f",
      "lt3825_g",
      "lt3825_h",
      "lt3825_i",
      "lt3825_j",
      "lt3825_l",
      "lt3825_ga",
      "lt3825_k",
      "lt3825_m",
      "lt3825_n",
      "lt3825_o",
      "lt3825_p",
      "lt3825_q",
      "lt3825_r",
      "lt3825_s",
      "lt3825_t",
      "lt3825_u",
      "lt3825_ha",
      "lt3825_ia",
      "lt3825_w",
      "lt3825_ja",
      "lt3825_x",
      "lt3825_y",
      "lt3825_v",
      "lt3825_z",
      "lt3825_A",
      "lt3825_B",
      "lt3825_C",
      "lt3825_D",
      "lt3825_E",
      "lt3825_F",
      "lt3825_G",
      "lt3825_H",
      "lt3825_I",
      "lt3825_J",
      "lt3825_L",
      "lt3825_M",
      "lt3825_N",
      "lt3825_K",
      "lt3825_ka",
      "lt3825_la",
      "lt3825_P",
      "lt3825_O",
      "lt3825_Q",
      "lt3825_R",
      "lt3825_S",
      "lt3825_T",
      "lt3825_ma",
      "lt3825_na",
      "lt3825_oa",
      "lt3825_pa",
      "lt3825_U",
      "lt3825_V",
      "lt3825_W",
      "lt3825_qa",
      "lt3825_sa",
      "lt3825_ra",
      "lt3825_X",
      "lt3825_ta",
      "lt3825_ua",
      "lt3825_Y",
      "lt3825_Z",
      "lt3825__",
      "lt3825_va",
      "lt3825_wa",
      "lt3825_xa",
      "lt3825_ya",
      "lt3825_0",
      "lt3825_za",
      "lt3825_Aa",
      "lt3825_Ba",
      "lt3825_1",
      "lt3825_Da",
      "lt3825_Ca",
      "lt3825_Ea",
      "lt3825_Fa",
      "lt3825_Ga",
      "lt3825_Ha",
      "lt3825_2",
      "lt3825_3",
      "lt3825_Ia",
      "lt3825_Ja",
      "lt3825_Ka",
      "lt3825_La",
      "lt3825_Ma",
      "lt3825_Na",
      "lt3825_Oa",
      "lt3825_Pa",
      "lt3825_Qa",
      "lt3825_5",
      "lt3825_6",
      "lt3825_Ta",
      "lt3825_Ua",
      "lt3825_Sa",
      "lt3825_Ra",
      "lt3825_Wa",
      "lt3825_Va",
      "lt3825_Ya",
      "lt3825_Xa",
      "lt3825_7",
      "lt3825_Za",
      "lt3825__a",
      "lt3825_0a",
      "lt3825_1a",
      "lt3825_2a",
      "lt3825_4a",
      "lt3825_7a",
      "lt3825_6a",
      "lt3825_3a",
      "lt3825_9a",
      "lt3825_5a",
      "lt3825_8a",
      "lt3825_ab",
      "lt3825_$a",
      "lt3825_bb",
      "lt3825_8",
      "lt3825_cb",
      "lt3825_db",
      "lt3825_eb",
      "lt3825_fb",
      "lt3825_gb",
      "lt3825_hb",
      "lt3825_ib",
      "lt3825_kb",
      "lt3825_$",
      "lt3825_jb",
      "lt3825_lb",
      "lt3825_9",
      "ppuWasShownFor3374427",
      "__underground",
      "vglnk",
      "s",
      "__v5k",
      "vl_cB",
      "vl_disable",
      "vglnk_16312892814196",
      "vglnk_16312892814207",
      "k",
      "_pqt8jsmehl",
      "ec55eztpw5",
      "setImmediate",
      "clearImmediate",
      "_wjwos",
      "_jswggtko",
      "_wgd8as395z",
      "_pkreuo",
      "_qnyld",
      "_mgIntExchangeNews",
      "AdskeeperInfC796805",
      "AdskeeperCContextBlock796805",
      "AdskeeperCMainBlock796805",
      "AdskeeperCInternalExchangeBlock796805",
      "AdskeeperCColorBlock796805",
      "AdskeeperCRejectBlock796805",
      "AdskeeperCInternalExchangeLoggerBlock796805",
      "AdskeeperCObserverBlock796805",
      "AdskeeperCSendDimensionsBlock796805",
      "AdskeeperCAntifraudStatisticsBlock796805",
      "AdskeeperCRtbBlock796805",
      "AdskeeperCContentPreviewBlock796805",
      "AdskeeperCGradientBlock796805",
      "AdskeeperCResponsiveBlock796805",
      "mg_loaded_526408_796805",
      "onClickExcludes",
      "mgReject796805",
      "mgLoadAds796805_12267",
      "AdskeeperCReject796805",
      "AdskeeperLoadGoods796805_12267",
      "_mgq",
      "_mgqp",
      "_mgqt",
      "_mgqi",
      "_mgCanonicalUri",
      "_mgPageViewEndPoint526408",
      "_mgPvid",
      "_mgPageView526408",
      "kkp4a5x5tv",
      "vglnk_16312893705126",
      "vglnk_16312893705127",
      "i.js.loaded",
      "i-noref.js.loaded",
      "$insertQueuef2e96b1e1637$",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "_mgwcapping",
      "_mgPageImp526408",
      "process_289289",
      "process_607019",
      "$insertf2e96b1e1637$",
    ],
    finalDownloadElementSelector: [["a[href*='.dailyuploads.net']"]],
    addHoverAbility: [["a[href*='.dailyuploads.net']"], ["#downloadBtnClick"]],
    addInfoBanner: [
      { targetElement: "a[href*='.dailyuploads.net']", where: "afterend" },
      { targetElement: "#downloadBtnClick", where: "afterend" },
    ],
    customScript() {
      this.waitUntilGlobalVariable("grecaptcha").then(() => {
        const form = document.forms.F1;
        form.removeAttribute("onsubmit");
        form.addEventListener(
          "submit",
          () => {
            this.$("#downloadBtnClick").textContent = "Loading...";
          },
          false
        );
        this.$("#downloadBtnClick")?.addEventListener(
          "click",
          function () {
            if (grecaptcha.getResponse()) {
              this.textContent = "Loading...";
            }
          },
          false
        );
        this.addCaptchaListener(form).then(() => {
          this.$("#downloadBtnClick").textContent = "Loading...";
        });
      });
      this.waitUntilSelector("#downloadBtnClick").then((btn) => {
        btn.className = "ss-btn";
      });
      this.waitUntilSelector(
        "body > div.banner > div > a[href*='dailyuploads']"
      ).then((btn) => {
        btn.className = "ss-btn";
      });
      let curr = this.$("form table").nextElementSibling;
      let old = null;
      while (curr != null) {
        old = curr;
        curr = curr.nextElementSibling;
        old.remove();
      }
    },
  },
  usersdrive: {
    host: ["usersdrive.com"],
    customStyle: `html{background:#121212!important}body{background:#121212!important;color:#dfdfdf!important;padding:0!important}.container-fluid main{background:#121212!important;padding:0!important}.down{display:flex!important;flex-direction:column!important;align-items:center!important}`,
    downloadPageCheckBySelector: [
      "button#method_free",
      "button#downloadbtn",
      "div a.btn-download.get-link",
    ],
    downloadPageCheckByRegex: [
      /Create Download Link/gi,
      /This direct link will be available/gi,
    ],
    remove: ["nav", "center", ".col-md", ".socialmedia", ".pro"],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "s",
      "O3AA",
      "K7mm",
      "L599",
      "n7mm",
      "Z3AA",
      "l3AA",
      "J3AA",
      "z599",
      "O599",
      "t599",
      "U2ii",
      "setPagination",
      "_gaq",
      "timeout",
      "ProgressBar",
      "_gat",
      "gaGlobal",
      "q9tt",
      "J911",
      "n3hh",
      "P9tt",
      "G3hh",
      "m3hh",
      "U3hh",
      "i911",
      "N911",
      "Q911",
      "c2ss",
      "a6_0x56ce",
      "a6_0x285a",
      "s2ss910ff",
      "s2ss910",
      "delComment",
      "player_start",
      "h",
      "set",
      "files",
      "uplist",
      "img",
      "price",
      "closure_lm_380100",
      "a8_0x328e",
      "a8_0x31d7",
      "utm910",
      "utsid-send",
      "_0x4ab4",
      "_0x4f3e",
      "sbslms",
      "_0xa5ec",
      "_0x4b20",
      "_0x42f0b5",
      "mm",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "rp",
      "_0xa6ab",
      "_0x41de",
      "EmailDialog",
    ],
    finalDownloadElementSelector: [
      [".down a", /This direct link will be available/gi],
    ],
    addHoverAbility: undefined,
    addInfoBanner: [],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.$(".row .col-md-4")?.classList?.replace("col-md-4", "col-md-12");
      this.addCaptchaListener(
        document.forms.F1,
        +this.$(".seconds").innerText || 17
      );
    },
  },
  indishare: {
    host: ["indi-share.net", "indi-share.com", "techmyntra.net"],
    customStyle: `html{background:#121212!important}body,.panelRight,h2{background:#121212!important;color:#dfdfdf!important;padding:0!important}#direct_link a{background-color:#008CBA;border:none;color:#fff;padding:15px 32px;text-align:center;text-decoration:none;display:inline-block;font-size:16px}#direct_link a:hover{background-color:#0A6BD1}#direct_link a:before{content:"Download"}#content{display:flex;flex-direction:column;align-items:center}#container{height:inherit !important;}`,
    downloadPageCheckBySelector: [
      "#downloadbtn",
      "#direct_link a",
      "a[rel*='noopener']",
    ],
    downloadPageCheckByRegex: [/direct link will be available/gi],
    remove: [
      ".sidenav",
      "#header",
      ".footerNavigation",
      "footer",
      "#direct_link a img",
      "#content > h3",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "_wpemojiSettings",
      "ytp",
      "onYouTubeIframeAPIReady",
      "getYTPVideoID",
      "uncamel",
      "setUnit",
      "setFilter",
      "nAgt",
      "isTouchSupported",
      "getOS",
      "nameOffset",
      "verOffset",
      "ix",
      "start",
      "end",
      "twemoji",
      "wp",
      "jQuery360069712562284331821",
      "scriptUrl",
      "ttPolicy",
      "YT",
      "YTConfig",
      "onYTReady",
      "yt",
      "ytDomDomGetNextId",
      "ytEventsEventsListeners",
      "ytEventsEventsCounter",
      "ytPubsubPubsubInstance",
      "ytPubsubPubsubTopicToKeys",
      "ytPubsubPubsubIsSynchronous",
      "ytPubsubPubsubSubscribedKeys",
      "ytLoggingTransportGELQueue_",
      "ytLoggingTransportTokensToCttTargetIds_",
      "ytLoggingGelSequenceIdObj_",
      "ytglobal",
      "ytPubsub2Pubsub2Instance",
      "ytPubsub2Pubsub2SubscribedKeys",
      "ytPubsub2Pubsub2TopicToKeys",
      "ytPubsub2Pubsub2IsAsync",
      "ytPubsub2Pubsub2SkipSubKey",
      "ytNetworklessLoggingInitializationOptions",
      "jQuery19104180234621619725",
      "setPagination",
      "_gaq",
      "s",
      "h6RR",
      "r1qq",
      "K6RR",
      "r6RR",
      "p6RR",
      "openNav",
      "closeNav",
      "_gat",
      "gaGlobal",
      "q9tt",
      "J911",
      "n3hh",
      "P9tt",
      "G3hh",
      "m3hh",
      "U3hh",
      "i911",
      "N911",
      "Q911",
      "c2ss",
      "_0xa5ec",
      "_0x4b20",
      "_0x42f0b5",
      "mm",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "rp",
      "adtrue_tags",
      "player_start",
      "countdown",
      "generateCb",
      "adtrue_time",
      "adtrue_cb",
      "adtrue_rtb",
      "q",
      "qs",
      "js_code",
      "k",
      "_0xa6ab",
      "_0x41de",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "_tal7bp6gdd",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_ugeyycf",
      "_qsjlbv",
      "delComment",
      "zfgproxyhttp",
      "_yioboic29r",
      "_ac96d98ingp",
      "_mgPageViewEndPoint659169",
      "_mgPvid",
      "_mgPageView659169",
      "_mgPageImp659169",
    ],
    finalDownloadElementSelector: [["#direct_link a"]],
    addHoverAbility: [["#direct_link a"]],
    addInfoBanner: [{ targetElement: "#direct_link", where: "afterend" }],
    customScript() {
      const firstBtn = this.$("a[rel*='noopener']");
      firstBtn?.click();
      const secondBtn = this.$("#downloadbtn");
      secondBtn?.click();
      const finalBtn = this.$("#direct_link");
      finalBtn.style.display = "";
    },
  },
  depositfiles: {
    host: ["depositfiles.com"],
    customStyle: `html{background:#121212!important}body{background:#121212!important;color:#dfdfdf!important;}#free_btn{background:#008CBA!important;border:none;color:#fff;padding:15px 32px;text-align:center;text-decoration:none;display:inline-block;font-size:16px}#free_btn:hover{background:#0A6BD1!important;}#download_recaptcha_container{display: flex;flex-direction: column;align-items: center;}`,
    downloadPageCheckBySelector: ["#free_btn", "#download_recaptcha"],
    downloadPageCheckByRegex: [/downloading mode!/gi],
    remove: [
      "#cookie_popup",
      ".top_menu",
      "#member_menu",
      ".content.right",
      "#foobar",
      ".banner1",
      ".violation",
      "div.choose",
      ".df_button:not([id])",
      ".gold_speed_promo_block.hide_download_started",
      ".sprite.download_icon",
      "[id^=ad]",
      "#download_waiter_container",
      "#confident_container",
      "div.string div.string_title",
      "img[src*='static.depositfiles.com']",
    ],
    removeByRegex: [{ query: "td.text", regex: /No Additional Fees!/gi }],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "cur",
      "fileQueued",
      "fileQueueError",
      "fileDialogComplete",
      "uploadStart",
      "uploadProgress",
      "uploadSuccess",
      "uploadError",
      "uploadComplete",
      "queueComplete",
      "swfobject",
      "activate_gold_key",
      "bonuser_paid_request_console_add_show",
      "bonuser_paid_request_console_remove_show",
      "bonuser_paid_request_console_close",
      "bonuser_paid_request_add",
      "bonuser_paid_request_remove",
      "read_get_param",
      "login_toggle",
      "get_display_text",
      "show_error",
      "load_recaptcha",
      "DP_jQuery_1631293565349",
      "SWFUpload",
      "fabHash",
      "ajload",
      "isopra",
      "isAbSpeedMode",
      "recaptcha_public_key",
      "recaptcha2PublicKey",
      "toggle",
      "cache_img",
      "is_copy_to_clipboard_enabled",
      "enable_copy_to_cliboard_links",
      "copy_to_clipboard",
      "get_elements_by_class",
      "zero_pad",
      "send_payoff",
      "DFUtils",
      "http_abs_path",
      "http_static_path",
      "ssl_static_path",
      "http_ads_path",
      "lang",
      "user_country",
      "RecaptchaOptions",
      "_0x4ab4",
      "_0x4f3e",
      "sbslms",
      "is_popup_showed",
      "begin_popup_url",
      "begin_script_url",
      "show_begin_popup",
      "show_url_start_time",
      "show_url_first",
      "show_url_r",
      "show_url",
      "img_code_form_submitted",
      "submit_img_code",
      "img_code_form_onsubmit",
      "on_event",
      "number_format",
      "img_code_cached",
      "img_code_icid",
      "cache_img_code",
      "refresh_img_code",
      "open_img_code_page",
      "addBookmark",
      "is_download_started",
      "download_started",
      "show_iframe_console",
      "iframe_console2_timer",
      "show_iframe_console2",
      "show_div_console",
      "backgroud_gray",
      "close_iframe_console",
      "close_iframe_oauth_login",
      "show_gold_offer",
      "show_gold_offer_div",
      "show_gold_offer_video",
      "close_gold_offer_video",
      "redirectAfterDownloadURL",
      "redirectCookieName",
      "setRedirectAfterDownloadURL",
      "showAfterDownloadStart",
      "usePayca",
      "payca",
      "ads_zone47_init",
      "regulardownload",
      "new_delay",
      "download_frm",
      "load_form",
      // "load_ajax",
      "checkJSPlugins",
      "check_recaptcha",
      "check_puzzlecaptcha",
      "check_captchme",
      "check_cap4a_captcha",
      "check_payca",
      "check_adverigo",
      "check_coinhive",
      "check_cpchcaptcha",
      "sleep",
      "abSafeCall",
      // "fid",
      "msg",
      "hLoadForm",
      "ads_zone40_init",
      "pageTracker",
      "FuckAdBlock",
      "fuckAdBlock",
      "_0x228c",
      "unblockia",
      "regeneratorRuntime",
      "setImmediate",
      "clearImmediate",
      "tcpusher",
      "_0xa5ec",
      "_0x4b20",
      "_0x42f0b5",
      "mm",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "rp",
      "__core-js_shared__",
      "__fp-init",
      "_0xa6ab",
      "_0x41de",
      "scroll_downloadblock",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: undefined,
    addInfoBanner: [],
    customScript() {
      this.addJQuery();
      this.$("#download_url")?.removeAttribute("style");
      this.waitUntilSelector("#free_btn").then(() => {
        document.body.insertAdjacentHTML(
          "beforeend",
          `<form id="customForm" method=post><input type="hidden" name="gateway_result" value="1"/><input type="hidden" name="asm" value="0"/></form>`
        );
        document.forms.customForm.submit();
      });
      this.waitUntilGlobalVariable("jQuery").then(async () => {
        await this.sleep(1000);
        const _this = this;
        // fetch(`/get_file.php?fid=${fid}&challenge=undefined&response=undefined&t=1`).then(res => res.text()).then(d => d.match(/action="([^"]+")\smethod/)?.[1])
        $.ajax({
          url: `/get_file.php?fid=${fid}&challenge=undefined&response=undefined&t=1`,
          success(data) {
            const tmp = $(data)
              .filter((i, e) => e.tagName == "FORM")
              .removeAttr("onsubmit");
            const dl_link = tmp.attr("action");
            _this.openNative(dl_link, "_self");
            $("#download_container").html(tmp);
            _this.$("#downloader_file_form a").href = dl_link;
          },
          error() {
            console.log("error");
          },
        });
      });
    },
  },
  clicknupload: {
    host: ["clicknupload.cc"],
    customStyle: `html, body, div.filepanel, .dfilename, #countdown, .seconds{background:#121212!important;color:#dfdfdf!important;height:inherit!important;}[id*=Ad],form>.regular{display:none!important;}#container{margin:0 auto!important;}#method_free{height:unset!important}`,
    downloadPageCheckBySelector: [
      "#method_free",
      "table table div",
      "button#downloadbtn",
    ],
    downloadPageCheckByRegex: [/direct link will be available/gi],
    remove: [
      "#mySidenav",
      ".page-buffer",
      "footer",
      ".SidemenuPanel",
      "#header",
      "#M307473ScriptRootC1090619",
      "#M307473ScriptRootC1086510",
      ".sharetabs",
      "#sharebuttons",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "_gaq",
      "openNav",
      "closeNav",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "_gat",
      "timeout",
      "k",
      "_m9t6byk4j6r",
      "4ud6s3ihpoa",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_qodsgee",
      "_wkeprv",
      "delComment",
      "player_start",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "$insertQueuef65abf16d287$",
      "dy72q5f5r3t",
      "$insertQueue7ef062992c2d$",
      "$insertQueuee22d894a4f46$",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "process_398378",
      "process_589016",
      "process_539121",
      "$insert7ef062992c2d$",
      "$inserte22d894a4f46$",
      "where",
      "_pop",
      "detectZoom",
      "iframe",
      "_pao",
      "win",
      "$insertQueue058a83516144$",
      "$insertQueue35ec50ccbd9c$",
      "setPagination",
      "_0xb050",
      "_0x1b62",
      "mm",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "_0xa6ab",
      "_0x41de",
      "_mgIntExchangeNews",
      "AdskeeperInfC1175753",
      "AdskeeperCContextBlock1175753",
      "AdskeeperCMainBlock1175753",
      "AdskeeperCInternalExchangeBlock1175753",
      "AdskeeperCColorBlock1175753",
      "AdskeeperCRejectBlock1175753",
      "AdskeeperCInternalExchangeLoggerBlock1175753",
      "AdskeeperCObserverBlock1175753",
      "AdskeeperCSendDimensionsBlock1175753",
      "AdskeeperCAntifraudStatisticsBlock1175753",
      "AdskeeperCRtbBlock1175753",
      "AdskeeperCIframeSizeChangerBlock1175753",
      "AdskeeperCContentPreviewBlock1175753",
      "AdskeeperCGradientBlock1175753",
      "AdskeeperCResponsiveBlock1175753",
      "mg_loaded_307473_1175753",
      "AdskeeperInfC1175754",
      "AdskeeperCContextBlock1175754",
      "AdskeeperCMainBlock1175754",
      "AdskeeperCInternalExchangeBlock1175754",
      "AdskeeperCColorBlock1175754",
      "AdskeeperCRejectBlock1175754",
      "AdskeeperCInternalExchangeLoggerBlock1175754",
      "AdskeeperCObserverBlock1175754",
      "AdskeeperCSendDimensionsBlock1175754",
      "AdskeeperCAntifraudStatisticsBlock1175754",
      "AdskeeperCRtbBlock1175754",
      "AdskeeperCIframeSizeChangerBlock1175754",
      "AdskeeperCContentPreviewBlock1175754",
      "AdskeeperCGradientBlock1175754",
      "AdskeeperCResponsiveBlock1175754",
      "mg_loaded_307473_1175754",
      "onClickExcludes",
      "mgReject1175753",
      "mgLoadAds1175753_085db",
      "AdskeeperCReject1175753",
      "AdskeeperLoadGoods1175753_085db",
      "_mgq",
      "_mgqp",
      "_mgqt",
      "_mgqi",
      "mgReject1175754",
      "mgLoadAds1175754_05024",
      "AdskeeperCReject1175754",
      "AdskeeperLoadGoods1175754_05024",
      "AdskeeperCSvsdsFlag",
      "_mgCanonicalUri",
      "_mgPageViewEndPoint307473",
      "_mgPvid",
      "_mgPageView307473",
      "i.js.loaded",
      "i-noref.js.loaded",
    ],
    // finalDownloadElementSelector: [],
    // addHoverAbility: [["button#downloadbtn.downloadbtn"]],
    addInfoBanner: [
      { targetElement: "div#content div.download", where: "afterend" },
    ],
    createCountdown: { element: ".seconds" },
    modifyButtons: [
      [
        "input#method_free",
        {
          replaceWithTag: "button",
          customText: "Free Download",
          moveTo: {
            target: "form > .regular",
            position: "beforeend",
            findParentByTag: "form",
          },
        },
      ],
      [
        "center > button#downloadbtn",
        { customText: "Create Download Link", makeListener: true },
      ],
      [
        "td > button#downloadbtn",
        {
          customText: "Start Download",
          replaceWithForm: true,
          fn(btn) {
            btn.href = btn
              .getAttribute("onclick")
              ?.replace(/window.open\('|'\);/gi, "");
          },
        },
      ],
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      // this.interceptAppendChild();
      // this.interceptAddEventListeners();
      // click the "Slow Download" option on page 1
      // this.$("#method_free")?.click();
      const captcha_box = this.$("table table div");

      if (captcha_box) {
        captcha_box.style.color = "#dfdfdf";
        captcha_box.style.background = "#121212";
        const captcha_code = [...captcha_box?.children]
          .sort(
            (x, y) =>
              x.style?.paddingLeft.match(/(\d+)/g)[0] -
              y.style?.paddingLeft.match(/(\d+)/g)[0]
          )
          .map((e) => e.textContent)
          .join("");
        this.$("input.captcha_code").value = captcha_code;
        // this.origSetTimeout(() => {
        //   document.forms?.F1?.submit();
        // }, this.$(".seconds").textContent * 1000 || 12 * 1000);
      }
      // this.waitUntilSelector("td > button#downloadbtn").then((btn) => {
      //   this.modifyButton(btn, {});
      //   const anchor = this.document.createElement("a");
      //   const dl_link = btn
      //     .getAttribute("onclick")
      //     ?.replace(/window.open\('|'\);/gi, "");
      //   anchor.href = dl_link;
      //   btn.replaceWith(
      //     this.makeSafeForm({ actionURL: dl_link, method: "GET" })
      //   );
      //   this.modifyButton(anchor, { customText: "Start Download" });
      //   this.addHoverAbility([".ss-btn"], false);
      //   this.openNative(dl_link, "_self");
      // });
    },
  },
  hexupload: {
    host: ["hexupload.net"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}#container{background:#121212!important;display:flex;flex-direction:column;justify-content:center;align-items:center}.container{background:#121212!important;display:flex;flex-direction:column;justify-content:center;align-items:center}.download_box{background-color:#323232!important}.bg-white{background:#121212!important}`,
    downloadPageCheckBySelector: [
      "input[name='method_free']",
      "a.link.act-link.btn-free",
      "button#downloadbtn",
      "table.file_slot",
    ],
    downloadPageCheckByRegex: [
      /Slow speed download/gi,
      /Create download link/gi,
      /This direct link will be available/gi,
    ],
    remove: [
      "nav",
      "footer",
      ".download-prepare",
      "#btn_method_premium",
      "#rul0sr8e6bmo1fbci4qu0",
      "div.sharetabs",
      "#sharebuttons",
      "body > div[id]:not([id^=container])",
      "#container > center",
      "#container > .row",
      "#countdown",
    ],
    removeByRegex: [
      { query: "center", regex: /All transactions are 100% safe and secure/gi },
    ],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "jQuery19104661553376883185",
      "clipboard",
      "_Hasync",
      "Tawk_API",
      "Tawk_LoadStart",
      "gtag",
      "dataLayer",
      "google_tag_manager",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "$_Tawk_AccountKey",
      "$_Tawk_WidgetId",
      "$_Tawk_Unstable",
      "$_Tawk",
      "chfh",
      "chfh2",
      "_HST_cntval",
      "Histats",
      "gaplugins",
      "gaGlobal",
      "gaData",
      "tawkJsonp",
      "$__TawkEngine",
      "EventEmitter",
      "$__TawkSocket",
      "__core-js_shared__",
      "regeneratorRuntime",
      "Tawk_Window",
      "_HistatsCounterGraphics_0_setValues",
      "emojione",
    ],
    finalDownloadElementSelector: [],
    // addHoverAbility: [["input[name='method_free']", false]],
    addInfoBanner: [{ targetElement: "form", where: "beforeend" }],
    modifyButtons: [
      [
        "input[name='method_free']",
        { replaceWithTag: "button", customText: "Start Download" },
      ],
    ],
    customScript() {
      // this.$("form[action='']")?.submit();
      this.$("input[name='method_free']")?.click();
      this.$$("*").forEach((e) => e.setAttribute("style", ""));
      // this.$$("body > div[id]")?.[1];

      // Allow time for hCaptcha to load
      // this.waitUntilGlobalVariable("hcaptcha").then(() =>
      //   hCaptchaListener(this.$("form[name='F1']"))
      // );
      // this.waitUntilGlobalVariable("Tawk_Window", "app", "$el").then((ele) =>
      //   ele.remove()
      // );
    },
  },
  veryfiles: {
    host: ["veryfiles.com"],
    customStyle: `html{background:#121212!important}body,.blockpage, .download1page .txt,.title{background:#121212!important;color:#dfdfdf!important}.download1page .blockpage .desc span,.download1page .blockpage .desc p{color:#dfdfdf!important}#wrapper{margin:unset!important;}`,
    downloadPageCheckBySelector: [
      "button#downloadbtn",
      "div.download1page",
      "#direct_link a",
    ],
    downloadPageCheckByRegex: [
      /File Download Link Generated/gi,
      /Click Here To Download/gi,
    ],
    remove: [
      "#sidebarphone",
      "header",
      "#Footer_Links",
      "footer",
      "#banner_ad",
      "iframe[name='__tcfapiLocator']",
      "[id^='ads']",
      "[class^=banner]",
      ".sharefile",
      "a[name='report-abuse']",
      "a[name='report-dmca']",
      "h2.maintitag",
      "form[name='F1'] .txt > p",
      "div.adsbox",
      "#commonId >:nth-child(n+2)",
      ".file-box",
      "#M560702ScriptRootC1171294",
      ".creation-container >:not(button):not(span#direct_link)",
      "ul.pageSuccess",
      "div.ppdr.ppdr-pps.rates-ppd",
      "div[style*='margin-bottom']",
      "iframe[data-id]",
    ],
    removeByRegex: [{ query: ".blockpage .row", regex: /About APK files/i }],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "_gaq",
      "__tcfapi",
      "__uspapi",
      "googletag",
      "_0x57e0",
      "nFNcksmwU",
      "XrhwLPllmYD",
      "KEQNPiZl",
      "PiuWFgLQ",
      "_0x41d7",
      "GKPEJSxZ",
      "x",
      "c2",
      "c1",
      "GSTS1a7nT",
      "MwCDvcOlP",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "_qevents",
      "_gat",
      "gaGlobal",
      "delComment",
      "player_start",
      "showFullScreen",
      "ggeac",
      "google_js_reporting_queue",
      "quantserve",
      "__qc",
      "ezt",
      "_qoptions",
      "qtrack",
      "regeneratorRuntime",
      "__tcfapiui",
      "closure_lm_316663",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_measure_js_timing",
      "goog_pvsid",
      "google_reactive_ads_global_state",
      "googleToken",
      "googleIMState",
      "processGoogleToken",
      "__google_ad_urls_id",
      "google_unique_id",
      "$insertQueue78db8f3e23fc$",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "process_384795",
      "pubcidCookie",
      "process_605336",
      "$insert78db8f3e23fc$",
      "__google_ad_urls",
      "google_osd_loaded",
      "google_onload_fired",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "GoogleGcLKhOms",
      "google_image_requests",
      "nH7eXzOsG",
      "ADAGIO",
      "ampInaboxPositionObserver",
      "ampInaboxFrameOverlayManager",
    ],
    finalDownloadElementSelector: [["#direct_link a"]],
    addHoverAbility: [["button#downloadbtn", true], ["#direct_link a"]],
    addInfoBanner: [
      { targetElement: ".blockpage", where: "beforeend" },
      { targetElement: "#commonId", where: "beforeend" },
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.waitUntilGlobalVariable("grecaptcha").then(() =>
        this.addCaptchaListener(
          document.forms.F1,
          +this.$(".seconds").innerText || 10
        )
      );
    },
  },
  douploads: {
    host: ["douploads.net"],
    customStyle: `html,body,#container,.fileInfo,.bg-white{background:#121212!important;color:#dfdfdf!important}.download_box{background-color:#323232!important}body > section,html>div,.it-client{display:none!important}body{padding-bottom:unset!important}`,
    downloadPageCheckBySelector: ["button[name='method_free']", "a#dl"],
    downloadPageCheckByRegex: [
      /Click here to download/gi,
      /This direct link will be available for/gi,
      /Create download link/gi,
    ],
    remove: [
      "nav",
      "footer",
      ".sharetabs ul",
      "#load img",
      "#gdpr-cookie-notice",
      "div.checkbox.text-center.mt-3.checkbox-info.off",
      "#news_last",
      "div.container.page.downloadPage > div > div.col-md-8.mt-5",
      "center",
    ],
    removeByRegex: [
      { query: ".download_method", regex: /fast download/gi },
      { query: "div.mt-5.text-center", regex: /No-Captcha & More/gi },
      { query: ".col-md-12", regex: /What is DoUploads/gi },
    ],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "s",
      "r0BB",
      "z0tt",
      "g011",
      "c0BB",
      "q0BB",
      "Y0BB",
      "X0BB",
      "g0BB",
      "setPagination",
      "_gaq",
      "timeout",
      "_gat",
      "q9tt",
      "J911",
      "n3hh",
      "P9tt",
      "G3hh",
      "m3hh",
      "U3hh",
      "i911",
      "N911",
      "Q911",
      "c2ss",
      "zfgformats",
      "zfgloadednative",
      "_retranberw",
      "L1ss",
      "l8T",
      "w5YYYY",
      "F1ss",
      "j3ww",
      "v3ww",
      "U3ww",
      "K8AA",
      "s8AA",
      "g8AA",
      "F4cc",
      "setImmediate",
      "clearImmediate",
      "_rhat4",
      "_p",
      "delComment",
      "player_start",
      "showFullScreen",
      "Trc4999Dh5",
      "_bp",
      "cookiesAgree",
      "ClipboardJS",
      "closure_lm_944715",
      "regeneratorRuntime",
      "__core-js_shared__",
      "_retranber",
      "wm",
      "oaid",
      "sdk",
      "installOnFly",
      "zfgloadedpush",
      "zfgloadedpushopt",
      "zfgloadedpushcode",
      "_0x2efe",
      "_0x2200",
      "_nps",
      "nsto",
      "k",
      "_7be3qu6shei",
      "_rpvlcmw",
      "_stoypgub",
      "ouw6id5g7wo",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "ppuWasShownFor2234052",
    ],
    finalDownloadElementSelector: [[".container.downloadPage > .row a.btn"]],
    addHoverAbility: [
      ["button#downloadbtn", true],
      ["button#downloadBtnClick", true],
      [".container.downloadPage > .row a.btn", false],
    ],
    addInfoBanner: [
      { targetElement: ".downloadPage > .row", where: "beforeend" },
    ],
    createCountdown: { element: ".seconds" },
    customScript() {
      this.interceptAppendChild((args) => {
        if (args[0]?.style?.zIndex.match(/68015990|999999/)) {
          this.logDebug("Blocked stupid thing");
          return false;
        }
        // this.origAppendChild.apply(this, arguments);
      });
      // Styling
      this.$("body").classList.remove("white");
      this.$("body").classList.add("dark");
      const setStyleSheet = (url) => {
        const stylesheet = document.getElementById("stylesheet");
        stylesheet.setAttribute("href", url);
      };
      this.window?.["setStyleSheet"]?.(
        "https://douploads.net/doup1/assets/styles/dark.min.css"
      );

      // Error Checks
      if (
        /proxy not allowed/gi.test(
          this.$("center div.alert.alert-danger")?.textContent
        )
      ) {
        this.log("Site does not like your IP address, stopping script");
        return;
      }

      // Automation
      this.$("button[name='method_free']")?.click();

      this.waitUntilSelector("button#downloadbtn").then((dl_btn) => {
        dl_btn.removeAttribute("style");
      });
      this.waitUntilSelector("html > div").then((div) => {
        div.remove();
      });
      this.waitUntilSelector(".it-client").then((div) => {
        div.remove();
      });
      this.waitUntilSelector(
        "div.container.page.downloadPage .col-md-4 a"
      ).then((div) => {
        // trick to remove anonymous event listeners (malicious)
        // https://stackoverflow.com/a/32809957
        document.body.outerHTML = document.body.outerHTML;
      });
      this.waitUntilGlobalVariable("grecaptcha").then(
        () => this.addCaptchaListener(document.forms.F1, 10)
        // this.addCaptchaListener(document.forms.F1, +this.$(".seconds").innerText || 10);
      );
      this.ifElementExists(
        "body > div.container.pt-5.page.downloadPage > div > div.col-md-4.mt-5",
        (query) => this.$(query)?.classList.replace("col-md-4", "col-12")
      );
      this.ifElementExists(
        ".container.pt-5.page.downloadPage > .row .col-md-4.mt-5.text-center",
        (query) => this.$(query)?.classList.replace("col-md-4", "col-12")
      );
    },
  },
  upfiles: {
    host: ["upfiles.io", "upfiles.com"],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}#container{background:#121212!important}.download_box{background-color:#323232!important}.bg-white{background:#121212!important}`,
    downloadPageCheckBySelector: [
      "button#method_free",
      "button#downloadbtn",
      "div a.btn-download.get-link",
    ],
    downloadPageCheckByRegex: [
      /Download: /gi,
      /Your download link is almost ready/gi,
      /Enter code below/gi,
    ],
    remove: [
      "header",
      "div.spacer",
      "section.page-title",
      "#ad-banner",
      "#cookie-bar",
      "footer",
      "section.faqs",
      "*[id^=ad]",
      "div.divider",
      "iframe:not([src*='recaptcha'])",
      // "iframe[class][scrolling][sandbox]",
      "body > div.container",
    ],
    removeByRegex: [{ query: "body > div.container", regex: /what is the/gi }],
    hideElements: undefined,
    removeIFrames: true,
    removeDisabledAttr: true,
    destroyWindowFunctions: [
      "k",
      "_t8h29e4ata9",
      "nd3z8ipji6k",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_cuohar",
      "_bvvxjxb",
      "adsbygoogle",
      "e",
      "webpackChunk",
      "uidEvent",
      "__core-js_shared__",
      "Dropzone",
      "onloadRecaptchaCallback",
      "onloadHCaptchaCallback",
      // "onbeforeunload",
      "gtag",
      "dataLayer",
      "a",
      "google_tag_manager",
      "closure_lm_725321",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "gaplugins",
      "gaGlobal",
      "gaData",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_user_agent_client_hint",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "ppuWasShownFor4299398",
      "blurred",
      "LAST_CORRECT_EVENT_TIME",
      "_3793154468",
      "_3036952004",
      "iinf",
      "1bgbb027-3b87-ae67-26ar-hz150f600z16",
      "_0xa5ec",
      "_0x4b20",
      "_0x42f0b5",
      "mm",
      "LieDetector",
      "AaDetector",
      "placementKey",
      "rp",
      "app_vars",
      "_0xa6ab",
      "_0x41de",
    ],
    finalDownloadElementSelector: [
      ["div a.btn-download.get-link[href^='http']"],
    ],
    addHoverAbility: [
      ["form button[type='submit']:not(#invisibleCaptchaShortlink)", false],
      ["form button#invisibleCaptchaShortlink", true],
    ],
    addInfoBanner: [{ targetElement: "form.text-center", where: "beforeend" }],
    createCountdown: { element: "#timer.timer" },
    customScript() {
      this.window.onbeforeunload = function () {};
      this.waitUntilSelector("div#captchaDownload").then(
        (captchaDownloadContainer) => {
          this.createGoogleRecaptcha(
            captchaDownloadContainer,
            "6LcsK9kaAAAAABe3I5PTS2zqmeKl3XueBrKNk3-Z"
          );
        }
      );
      this.waitUntilSelector("form#go-link").then(async (form) => {
        const url = form.action;
        const body = {};
        form.querySelectorAll("input").forEach((e) => (body[e.name] = e.value));
        await this.sleep(10 * 1000);
        await fetch(url, {
          headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-requested-with": "XMLHttpRequest",
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          body: new URLSearchParams(body).toString(),
          method: "POST",
          mode: "cors",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            const btn = this.$("a.get-link");
            btn.href = data.url;
            btn.classList.remove("disabled");
            btn.innerText = "Download";
          });
      });
      /*
      This was needed before destroyWindowFunctions to stop the ads, but not anymore.
      Keeping it just in case.
      */
      // this.waitUntilSelector("iframe[class][scrolling][sandbox]").then((ele) =>
      //   ele.remove()
      // );

      // // stop script from adding malicious redirects over top of google recaptcha
      // const appChild = document.body.appendChild;
      // document.body.appendChild = function (x) {
      //   // stupid overlay has hard-coded z-index of 2147483647
      //   if (x?.style.zIndex == "2147483647") {
      //     return;
      //   }
      //   appChild.apply(this, arguments);
      // };

      // page 1
      this.$("section.form-main.file-main form:not([id])")?.submit();

      // page 2
      // if (!this.$("#captchaDownload")) {
      //   this.$("#invisibleCaptchaShortlink")?.click();
      // } else {
      //   this.waitUntilGlobalVariable("grecaptcha").then(() =>
      //     googleRecaptchaListener(document.forms?.["file-captcha"])
      //   );
      // }
      this.waitUntilGlobalVariable("grecaptcha").then(() =>
        this.addCaptchaListener(document.forms?.["file-captcha"])
      );
    },
  },
  tusfiles: {
    host: ["tusfiles.com"],
    customStyle: `html,body,.box{background:#121212!important;color:#dfdfdf!important}body{min-height:unset!important}`,
    downloadPageCheckBySelector: ["form[name='F1']", "button#downloadbtn"],
    downloadPageCheckByRegex: [],
    remove: [],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "k",
      "_489b31ngxhe",
      "h2canfv0wdg",
      "zfgformats",
      "setImmediate",
      "clearImmediate",
      "_gcpdyiwz",
      "_eldwza",
      "__rocketLoaderEventCtor",
      "__rocketLoaderLoadProgressSimulator",
      "__cfQR",
      "delComment",
      "player_start",
      "copyc",
      "jQuery110206240749867981399",
      "app",
      "cookieconsent",
      "gtag",
      "dataLayer",
      "__cfRLUnblockHandlers",
      "google_tag_manager",
      "google_tag_data",
      "GoogleAnalyticsObject",
      "ga",
      "onClickTrigger",
      "kkp4a5x5tv",
      "zfgloadedpopup",
      "ppuWasShownFor2876021",
      "gaplugins",
      "gaGlobal",
      "gaData",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [{ targetElement: "form[name='F1']", where: "beforebegin" }],
    createCountdown: {},
    modifyButtons: [
      [
        "button#downloadbtn",
        { customText: "Start Download", makeListener: true },
      ],
    ],
    customScript() {},
  },
  centfile: {
    host: ["centfile.com"],
    customStyle: `html,body,.box,header,.page-wrap,div.text-center > div.text-center,.page-wrap > div:not([class*=ss-alert]),table tbody,table tbody tr:nth-child(even){background:#121212!important;color:#dfdfdf!important}a{color:#94b9ff!important}.rightcol{margin:25px!important}`,
    downloadPageCheckBySelector: ["button#method_free"],
    downloadPageCheckByRegex: [/for your IP next 24 hours/gi],
    remove: [
      "div.top",
      "p[align='center']",
      "footer",
      "#fb-root",
      "#fixedban",
      "#back-to-top",
      "br",
      "div.pricingboxes-comparison",
      "div.row.collapse",
      "ul.features",
      "center > b",
      "div.header.d-flex",
      "[id*='hiddensection']",
      ".adsbygoogle",
      ".download_method a",
      "fixedban",
      "#close-fixedban",
      ".slicknav_menu",
      "pace",
      "button.btn-xs.btn-link",
      "table.filepanel tr:nth-child(5)",
      ".row > .col-md-4:nth-child(3) button",
    ],
    removeByRegex: [
      { query: "center div[style*='800']", regex: /TRAVEL SINGAPORE CITY/gi },
      {
        query: ".row div.col-md-4.text-center:nth-child(n+2)",
        regex: /dowasdadnload/gi,
      },
    ],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "fbAsyncInit",
      "FB",
      "adsbygoogle",
      "Pace",
      "WOW",
      "speed",
      "startTicker",
      "animateTickerElementHorz",
      "canTick",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_spfd",
      "google_unique_id",
      "google_sv_map",
      "google_user_agent_client_hint",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "gaGlobal",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "google_osd_loaded",
      "google_onload_fired",
      "Goog_Osd_UnloadAdBlock",
      "Goog_Osd_UpdateElementToMeasure",
      "google_osd_amcb",
      "GoogleGcLKhOms",
      "google_image_requests",
      "share_facebook",
      "share_twitter",
      "share_gplus",
      "share_vk",
      "timeout",
      "didntload",
      "loads",
      "google_lpabyc",
      "delComment",
      "player_start",
      "closure_lm_155599",
      "google_trust_token_operation_promise",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [{ targetElement: "form[name='F1']", where: "afterend" }],
    createCountdown: {},
    modifyButtons: [
      [
        "form[name='F1'] button[name='method_free']",
        {
          customText: "Free Download",
          makeListener: true,
          moveTo: { target: "form[name='F1']", position: "beforeend" },
          requiresCaptcha: true,
        },
      ],
      [
        "form[name='F1'] input[name='method_free']",
        {
          customText: "Free Download",
          makeListener: true,
          moveTo: { target: "form[name='F1']", position: "beforeend" },
          requiresCaptcha: true,
          replaceWithTag: "button",
        },
      ],
      [
        "form:not([name='F1']) input[name='method_free']",
        {
          customText: "Free Download",
          makeListener: true,
          replaceWithTag: "button",
        },
      ],
    ],
    customScript() {
      this.$$(".col-md-4").forEach((e) =>
        e.classList.replace("col-md-4", "col-md-12")
      );
      this.waitUntilSelector(".err").then((err) => {
        const parent = err.parentElement;
        parent.insertAdjacentElement("beforebegin", err);
      });
      this.waitUntilSelector("div > span > a[href][onclick]").then((dl_btn) => {
        const target = this.$(".page-wrap");
        target?.insertAdjacentElement(
          "beforeend",
          this.makeSafeForm({ actionURL: dl_btn.href, method: "GET" })
        );
        this.addInfoBanner({ targetElement: target, where: "beforeend" });
        this.findParentElementByTagName(dl_btn, "center")?.remove?.();
        dl_btn.remove();
      });
      this.waitUntilSelector(".ss-btn-ready").then((btn) => btn?.click());
    },
  },
  fastclick: {
    host: ["fastclick.to"],
    customStyle: `html,body,main,#container,.bg-white{background:#121212!important;color:#dfdfdf!important}a{color:#94b9ff!important}.rightcol{margin:25px!important}div.py-3.px-5.rounded-lg.mb-4.mb-xl-6.text-primary.d-flex.align-items-center{background:#212121!important}.text-primary{color:#6e6fef!important}`,
    downloadPageCheckBySelector: [
      "button#method_free",
      "button#downloadbtn.downloadbtn",
      "a.btn-download.btn",
    ],
    downloadPageCheckByRegex: [],
    remove: [
      "header",
      "footer",
      "div.dowload-features",
      "main .container .container",
      "div.h2.text-center.mb-3",
      "a[href*='premium']",
      "div.download-page.text-white.mb-4.mb-lg-6",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "_gaq",
      "_gat",
      "gaGlobal",
      "Dialogs",
      "delComment",
      "player_start",
      "timer",
      "closure_lm_182125",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [],
    createCountdown: { element: "div.timer-count" },
    modifyButtons: [
      [
        "button#method_free.download-btn",
        {
          customText: "Free Download",
          moveTo: { target: "form[action='']", position: "beforeend" },
        },
      ],
      [
        "button#downloadbtn.downloadbtn",
        { requiresCaptcha: true, makeListener: true },
      ],
      ["a.btn-download.btn", { replaceWithForm: true }],
    ],
    customScript() {},
  },
  chedrive: {
    host: ["chedrive.com"],
    customStyle: `html,body,.blockpage,.desc span{background:#121212!important;color:#dfdfdf!important}.blockpage,a:not([href]){color:#121212!important}`,
    downloadPageCheckBySelector: [
      "form[name='F1']",
      "button#downloadbtn",
      "span#direct_link a",
    ],
    downloadPageCheckByRegex: [/File Download Link Generated/gi],
    remove: [
      "#sidebarphone",
      "header",
      "footer",
      "#footer2",
      "#gdpr-cookie-notice",
      ".menufooter",
      ".as_ads_guard",
      "br",
      "[class^=banner]",
      "#wrapper > div > div > form > div > div.col-xs-12.col-sm-12.col-md-8.col-lg-8",
      ".adsbox",
      ".sharefile",
      ".download0page",
      "#banner_ad", //BlockAdBlock div
      "#countdown",
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [
      "setPagination",
      "_gaq",
      "WOW",
      "_taboola",
      "google_js_reporting_queue",
      "google_srt",
      "google_logging_queue",
      "google_ad_modifications",
      "ggeac",
      "google_measure_js_timing",
      "google_reactive_ads_global_state",
      "adsbygoogle",
      "_gfp_a_",
      "google_sa_queue",
      "google_sl_win",
      "google_process_slots",
      "google_spfd",
      "google_unique_id",
      "google_sv_map",
      "google_user_agent_client_hint",
      "downloadJSAtOnload",
      "_gat",
      "gaGlobal",
      "Goog_AdSense_getAdAdapterInstance",
      "Goog_AdSense_OsdAdapter",
      "google_sa_impl",
      "google_persistent_state_async",
      "__google_ad_urls",
      "google_global_correlator",
      "__google_ad_urls_id",
      "googleToken",
      "googleIMState",
      "_gfp_p_",
      "processGoogleToken",
      "google_prev_clients",
      "goog_pvsid",
      "google_jobrunner",
      "ampInaboxIframes",
      "ampInaboxPendingMessages",
      "goog_sdr_l",
      "timeout",
      "google_lpabyc",
      "relocate_home",
      "delComment",
      "player_start",
      "showFullScreen",
      "cookiesAgree",
      "GoogleGcLKhOms",
      "google_image_requests",
      "kAWgyOxXhTis",
      "vRowKfzUKP",
      "cIuqJzgWhJ",
      "JhOjFdIupR",
      "ZWTPEQZYhZ",
      "kRBeOhzLuY",
      "oAAUBciJwG",
      "CWSTRhNQZH",
      "c2",
      "c1",
      "mAsZVZBrQfEY",
      "RbntPCrNXp",
    ],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [
      { targetElement: "#commonId", where: "beforeend" },
      { targetElement: "span#direct_link", where: "afterend" },
    ],
    createCountdown: {}, // ".seconds" - but page doesnt check if you waited or not
    modifyButtons: [
      [
        "button#downloadbtn.downloadbtn",
        { customText: "Create Download Link" },
      ],
      [
        "span#direct_link a",
        { customText: "Start Download", replaceWithForm: true },
      ],
    ],
    customScript() {
      this.waitUntilSelector("div.col-xs-12.col-sm-12.col-md-4.col-lg-4").then(
        (div) => (div.className = "col-12")
      );
      console.timeEnd("ss");
    },
  },
  nitro: {
    host: ["nitro.download"],
    customStyle: `html,body,#container,legend,#view,h1{background:#121212!important;color:#dfdfdf!important}#container{box-shadow:unset!important}a{color:#3096fb!important}`,
    downloadPageCheckBySelector: ["button#slow-download", "#startFreeDownload"],
    downloadPageCheckByRegex: [],
    remove: [
      "#header",
      "#footer",
      "#footerCredits",
      "#lang",
      "body > div[style*='color: #fff']",
      "[id*='superbox']",
      "#bottomAlerts",
      "#alerts",
      ".purchaseNoWaiting",
      ".noticeMessage",
      "#popupContent",
      "#triggerPopup",
      // "#beforeReCaptcha"
    ],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [],
    createCountdown: { timer: 120 },
    modifyButtons: [
      ["button#slow-download", {}],
      [
        "button#sendReCaptcha",
        { customText: "Free Download", requiresCaptcha: true },
      ],
      [
        "button#beforeStartTimerBtn",
        { customText: "Start Timer", requiresCaptcha: true },
      ],
    ],
    customScript() {
      this.waitUntilSelector("button#slow-download").then((btn) => {
        const form = btn.parentElement;
        // btn = this.modifyButton(btn, {})
        this.$("#container")?.insertAdjacentElement("afterbegin", form);
        this.$("#container > .content")?.remove();
      });
      this.waitUntilSelector("form#startFreeDownload").then((form) => {
        // btn = this.modifyButton(btn, {})
        return;
        form.style = "";
        this.$("#container")?.insertAdjacentElement("afterbegin", form);
        this.$("#container > .content")?.remove();
      });
      this.waitUntilSelector("#reCaptcha").then((div) => {
        div.style = "";
      });
      this.waitUntilSelector("a#download").then((btn) => {
        this.modifyButton(btn, {
          replaceWithForm: true,
          customText: "Start Download",
        });
      });
    },
  },
  NEWSITE: {
    host: [],
    customStyle: `html,body{background:#121212!important;color:#dfdfdf!important}`,
    downloadPageCheckBySelector: [],
    downloadPageCheckByRegex: [],
    remove: [],
    removeByRegex: [],
    hideElements: undefined,
    removeIFrames: false,
    removeDisabledAttr: false,
    destroyWindowFunctions: [],
    finalDownloadElementSelector: [],
    addHoverAbility: [],
    addInfoBanner: [],
    createCountdown: "",
    modifyButtons: [],
    customScript() {},
  },
};

for (const site in siteRules) {
  const currSiteRules = siteRules[site];
  if (
    currSiteRules.host.some((urlMatch) => {
      if (urlMatch instanceof RegExp) {
        return Boolean(document.domain.match(urlMatch));
      } else {
        return document.domain.includes(urlMatch);
      }
    })
  ) {
    // const specialName =
    //   "SS" + Math.floor(Math.random() * 982451653).toString(36);
    // oSiteScrubber = window[specialName] = new SiteScrubber(currSiteRules);
    // oSiteScrubber.setup();
    window.Object.defineProperty(window, "siteScrubber", {
      enumerable: false,
      writable: false,
      configurable: false,
      value: new SiteScrubber(currSiteRules),
    });
    // window["siteScrubber"] = new SiteScrubber(currSiteRules);
    siteScrubber.setup();
    break;
    // const currSiteRules = siteRules[site];
    // this.logDebug(`Using site rules for site: ${site}`);
    // return this.setup();

    // this.addCustomCSSStyle(this.currSiteRules?.customStyle);
    // if (
    //   this.document.readyState === "complete" ||
    //   this.document.readyState === "interactive"
    // ) {
    //   this.applyRules();
    // } else {
    //   this.window.addEventListener("DOMContentLoaded", () => {
    //     this.applyRules();
    //   });
    // }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
