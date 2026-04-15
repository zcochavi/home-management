// Runs in the Webtop page context (not isolated content script world).
// Intercepts both fetch AND XMLHttpRequest to capture the Webtop session
// token and homework params, regardless of which transport the app uses.
(function () {

  function handleLoginData(data) {
    if (data?.status && data?.data?.token) {
      window.postMessage({
        type: 'FH_WEBTOP_LOGIN',
        payload: {
          token:           data.data.token,
          userId:          data.data.userId,
          classCode:       data.data.classCode,
          classNumber:     data.data.classNumber,
          schoolId:        data.data.schoolId,
          institutionCode: data.data.institutionCode,
          firstName:       data.data.firstName,
          lastName:        data.data.lastName,
          schoolName:      data.data.schoolName,
        }
      }, '*');
    }
  }

  function handleParamsBody(bodyStr) {
    try {
      const params = JSON.parse(bodyStr || '');
      if (params.weekIndex === 0) {
        window.postMessage({ type: 'FH_WEBTOP_PARAMS', payload: params }, '*');
      }
    } catch (_) {}
  }

  // ── Patch fetch ────────────────────────────────────────────────────────────
  const _origFetch = window.fetch;
  window.fetch = async function (url, opts) {
    const response = await _origFetch.apply(this, arguments);
    const urlStr = (typeof url === 'string' ? url : url?.toString()) || '';

    if (urlStr.includes('LoginMoe')) {
      response.clone().json().then(handleLoginData).catch(() => {});
    }
    if (urlStr.includes('GetPupilLessonsAndHomework') && opts?.body) {
      handleParamsBody(opts.body);
    }
    return response;
  };

  // ── Patch XMLHttpRequest ───────────────────────────────────────────────────
  const _origOpen = XMLHttpRequest.prototype.open;
  const _origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._fhUrl = (url || '').toString();
    return _origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const url = this._fhUrl || '';
    if (url.includes('LoginMoe') || url.includes('GetPupilLessonsAndHomework')) {
      this.addEventListener('load', function () {
        try {
          const data = JSON.parse(this.responseText);
          if (url.includes('LoginMoe')) handleLoginData(data);
          if (url.includes('GetPupilLessonsAndHomework')) handleParamsBody(body);
        } catch (_) {}
      });
    }
    return _origSend.apply(this, arguments);
  };

})();
