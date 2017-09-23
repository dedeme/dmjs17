// Copyright 03-Sep-2017 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

/** Random Box */
goog.provide("github.dedeme.Rbox");

/**
 * Object for selecting among a group of elements in random way. When all
 * then elements have been selected, Box is reloaded with the same elements in
 * different order.
 * @template T
 */
github.dedeme.Rbox = class {

  /** @param {!Array<T>} es Elements of Rbox */
  constructor (es) {
    /** @private */
    this._es = es;
    /** @private */
    this._box = github.dedeme.It.from(es).shuffle().to();
  }

  /**
   * Returns next random element.
   * @return {T}
   */
  next () {
    if (this._box.length === 0)
      this._box = github.dedeme.It.from(this._es).shuffle().to();
    return this._box.pop();
  }

  /**
   * Returns [this] in It form. It has not limit of elements.
   * @return {!github.dedeme.It<T>}
   */
  to () {
    const self = this;
    return new github.dedeme.It(() => true, () => self.next());
  }

  /**
   * Returns a Rbox with repeated elements
   * @template T
   * @param {!Array<!Tp<T, number>>} es Description of box elements.
   *        For example:
   *        Rbox.mk([("a", 1),("b", 2)]) creates elements "a","b","b".
   * @return {!github.dedeme.Rbox<T>}
   */
  static mk (es) {
    const r = [];
    It.from(es).each(function (e) {
      for (let i = 0; i < e.e2(); ++i) r.push(e.e1());
    });
    return new github.dedeme.Rbox(r);
  };
}