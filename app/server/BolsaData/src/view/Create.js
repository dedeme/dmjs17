// Copyright 22-Nov-2017 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

goog.provide("view_Create");
/**
 * Create a new company data.<p>
 * It uses the Invertia web site.<p>
 * When index is '1', it remove all the previous Quotes and reads 600 new
 * ones. If index has another value, it adds Quotes from such page until reach
 * 600.
 */
view_Create = class {
  /**
   * @param {!Main} control
   */
  constructor (control) {
    /** @private */
    this._control = control;
  }

  /**
   * @return {void}
   */
  show () {
    const control = this._control;
    const db = control.db();

    const nick = $("input");
    const key = $("input");
    const accept = $("button").html(_("Accept")).on("click", ev => {
      control.create(
        nick.value().trim(),
        key.value().trim(),
        counter
      );
    });
    const counter = $("span").klass("frame");
    control.dom().show("create", $("table").att("align", "center")
      .add($("tr")
        .add($("td").html(_("Nick")))
        .add($("td").html(_("Invertia key")))
        .add($("td").html(_("Index")))
        .add($("td")))
      .add($("tr")
        .add($("td").add(nick))
        .add($("td").add(key))
        .add($("td").add(accept)))
      .add($("tr")
        .add($("td").att("colspan", 4)))
      .add($("tr")
        .add($("td").att("colspan", 4).style("text-align:center")
          .add(counter)))
    );
  }
}


