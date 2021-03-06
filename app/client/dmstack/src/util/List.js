// Copyright 04-Oct-2019 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

/**
  Linked list.
  @template T
  @implements {Iterable<T>}
**/
export default class List {
  constructor () {
    this._head = null;
    this._tail = null;
  }

  /**
    @template T
    @return {T}
  **/
  get head () {
    if (this._tail === null) throw "List is empty";
    return this._head;
  }

  /**
    @template T
    @return {!List<T>}
  **/
  get tail () {
    if (this._tail === null) throw "List is empty";
    return this._tail;
  }

  /** @return {boolean} */
  isEmpty () {
    return this._tail === null;
  }

  /**
    @param {T} value
    @return {!List<T>}
  **/
  cons (value) {
    const r = new List();
    r._head = value;
    r._tail = this;
    return r;
  }

  /** @return {number} */
  count () {
    let n = 0;
    let l = this; // eslint-disable-line
    while (l._tail !== null) {
      ++n;
      l = l._tail;
    }
    return n;
  }

  /**
    @template T
    @return {!List<T>}
  **/
  reverse () {
    let l = this; // eslint-disable-line
    let r = new List();
    while (l._tail !== null) {
      r = r.cons(l._head);
      l = l._tail;
    }
    return r;
  }

  /**
    @template T
    @return {!Array<T>}
  **/
  toArray () {
    const a = [];
    let l = this; // eslint-disable-line
    while (l._tail !== null) {
      a.push(l._head);
      l = l._tail;
    }
    return a;
  }

  /**
    @template T
    @param {!Array<T>} a
    @return {!List<T>}
  **/
  static fromArray (a) {
    let r = new List();
    for (let i = a.length - 1; i >= 0; --i) r = r.cons(a[i]);
    return r;
  }

  /**
    @template T
    @param {!Array<T>} a
    @return {!List<T>}
  **/
  static fromArrayReverse (a) {
    let r = new List();
    for (const e of a) r = r.cons(e);
    return r;
  }

}

