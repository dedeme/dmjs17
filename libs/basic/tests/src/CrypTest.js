// Copyright 03-Sep-2017 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

goog.provide("CrypTest");
goog.require("github.dedeme");

CrypTest = class {
  static run() {
    const t = new Test("Cryp");

    t.eq(Cryp.genK(12).length, 12);
//    console.log(Cryp.genK(6));
    t.eq(Cryp.key("deme", 6), "XPxE/l");
    t.eq(Cryp.cryp("deme", "Cañón€%ç"), "qYLAiaLPhKyauKOqw4bBu8TcjIU=");
    t.eq(Cryp.decryp("deme", Cryp.cryp("deme", "Cañón€%ç")), "Cañón€%ç");
    t.eq(Cryp.decryp("deme", Cryp.cryp("deme", "1")), "1");
    t.eq(Cryp.decryp("deme", Cryp.cryp("deme", "")), "");
    t.eq(Cryp.decryp("", Cryp.cryp("", "Cañón€%ç")), "Cañón€%ç");
    t.eq(Cryp.decryp("", Cryp.cryp("", "1")), "1");
    t.eq(Cryp.decryp("", Cryp.cryp("", "")), "");

    t.log();
  }
}

