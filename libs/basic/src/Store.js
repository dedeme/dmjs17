// Copyright 04-Sep-2017 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

goog.provide("github.dedeme.Store")
goog.require("github.dedeme.It")

github.dedeme.Store = class {

  /** Removes all keys of local storage */
  static clear () {
    window.localStorage.clear();
  }

  /**
   * Removes the key [key]  of local storage
   * @param {string} key
   */
  static del (key) {
    window.localStorage.removeItem(key);
  }

  /**
   * Removes some [keys] past the time [time] since it was called itself.<p>
   * If it has not called ever delete keys too.
   * @param {string} tKey Storage key for saving the time
   * @param {!Array<string>} keys Array with the keys to remove
   * @param {number}time Time in hours
   */
  static expires (tKey, keys, time) {
    const dt = new Date(Date.now()).getTime();
    const ks = github.dedeme.Store.take(tKey);
    if (ks === null || dt > +ks) {
      github.dedeme.It.from(keys).each(k => {
        github.dedeme.Store.del(k);
      });
    }
    github.dedeme.Store.put(tKey, "" + (dt + time * 3600000));
  }

  /**
   * Returns the value of key [key] or <b>null</b> if it does not exists
   * of local storage.
   * @param {string} key
   * @return {?string}
   */
  static take (key) {
    const r = window.localStorage.getItem(key);
    return r === "null" ? null : r;
  }

  /**
   * Returns the key in position [ix] of local storage.
   * @param {number} ix
   * @return {?string}
   */
  static key (ix) {
    return window.localStorage.key(ix);
  }

  /**
   * Returns a It with all keys of local storage.
   * @return {!github.dedeme.It<string>}
   */
  static keys () {
    const sz = github.dedeme.Store.size();
    let c = 0;
    return new github.dedeme.It(
      () => c < sz,
      () => window.localStorage.key(c++)
    );
  }

  /**
   * Puts a new value in local storage.
   * @param {string} key
   * @param {string} value
   */
  static put (key, value) {
    window.localStorage.setItem(key, value);
  }

  /**
   * Returns the number of elements of local storage
   * @return {number}
   */
  static size () {
    return window.localStorage.length;
  }

  /**
   * Returns a It with all values of local storage.
   * @return {!github.dedeme.It<string>}
   */
  static values () {
    return github.dedeme.Store.keys().map(e => github.dedeme.Store.take(e));
  }

  /** Removes all keys of session storage */
  static sessionClear () {
    window.sessionStorage.clear();
  }

  /**
   * Removes the key [key]  of session storage
   * @param {string} key
   */
  static sessionDel (key) {
    window.sessionStorage.removeItem(key);
  }

  /**
   * Returns the value of key [key] or <b>null</b> if it does not exists
   * of session storage.
   * @param {string} key
   * @return {?string}
   */
  static sessionTake (key) {
    const r = window.sessionStorage.getItem(key);
    return r === "null" ? null : r;
  }

  /**
   * Returns the key in position [ix] of session storage.
   * @param {number} ix
   * @return {?string}
   */
  static sessionKey (ix) {
    return window.sessionStorage.key(ix);
  }

  /**
   * Returns a It with all keys of session storage.
   * @return {!github.dedeme.It<string>}
   */
  static sessionKeys () {
    const sz = github.dedeme.Store.size();
    let c = 0;
    return new github.dedeme.It(
      () => c < sz,
      () => window.sessionStorage.key(c++)
    );
  }

  /**
   * Puts a new value in session storage.
   * @param {string} key
   * @param {string} value
   */
  static sessionPut (key, value) {
    window.sessionStorage.setItem(key, value);
  }

  /**
   * Returns the number of elements of session storage
   * @return {number}
   */
  static sessionSize () {
    return window.sessionStorage.length;
  }

  /**
   * Returns a It with all values of session storage.
   * @return {!github.dedeme.It<string>}
   */
  static sessionValues  () {
    return github.dedeme.Store.sessionKeys().map(e =>
      github.dedeme.Store.sessionTake(e)
    );
  }
}
