// Copyright 23-Sep-2017 ºDeme
// GNU General Public License - V3 <http://www.gnu.org/licenses/>

goog.provide("Main");

goog.require("github_dedeme");
goog.require("I18n");
goog.require("Dom");
goog.require("user_Expired");
goog.require("user_Auth");
goog.require("user_Chpass");
goog.require("Conf");
goog.require("Db");
goog.require("view_Bye");
goog.require("view_Year");
goog.require("view_Diary");
goog.require("view_Cash");
goog.require("view_Accs");
goog.require("view_Summaries");
goog.require("view_Plan");
goog.require("view_Backups");
goog.require("view_Settings");

Main = class {
  constructor () {
    /**
     * @private
     * @type {Db}
     */
    this._db = null;
    /**
     * @private
     * @type {Conf}
     */
    this._conf = null;
    /** @private */
    this._client = new Client(
      Main.app(),
      () => { new user_Expired(this).show(); }
    );
    /** @private */
    this._dom = new Dom(this);
    /**
     * @private
     * @type {!Array<string>}
     */
    this._backups = [];
    /**
     * @private
     * @type {!Array<string>}
     */
    this._trash = [];
  }

  /** @return {string} */
  static app () {
    return "Hconta";
  }

  /** @return {string} */
  static version () {
    return "201801";
  }

  /** @return {string} */
  static langStore () {
    return Main.app() + "__lang";
  }

  /** @return {string} */
  static captchaAuthStore () {
    return Main.app() + "__captcha";
  }

  /** @return {string} */
  static captchaChpassStore () {
    return Main.app() + "__captchaCh";
  }

  /** @return {!Db} */
  db () {
    if (this._db === null) {
      throw ("db is null");
    }
    return this._db;
  }

  /** @return {!Conf} */
  conf () {
    if (this._conf === null) {
      throw ("conf is null");
    }
    return this._conf;
  }

  /** @return {!Dom} */
  dom () {
    return this._dom;
  }

  /** @return {!Array<string>} */
  backups () {
    return this._backups;
  }

  /** @return {!Array<string>} */
  trash () {
    return this._trash;
  }

  run () {
    const self = this;
    const client = self._client;
    client.connect(ok => {
      if (ok) {
        let data = {"rq": "getConf"};
        client.send(data, rp => {
          self._conf = Conf.restore(rp["conf"]);
          const conf = self._conf;
          conf.language() === "es" ? I18n.es() : I18n.en();
          let data = {"rq": "getDb", "year": "" + conf.year()};
          client.send(data, rp => {
            self._db = Db.restore(rp["db"]);
            this._backups = rp["backups"];
            this._trash = rp["trash"];
            switch(conf.page()) {
            case "year":
              new view_Year(self).show();
              break;
            case "diary":
              new view_Diary(self).show();
              break;
            case "cash":
              new view_Cash(self).show();
              break;
            case "accs":
              new view_Accs(self).show();
              break;
            case "summaries":
              new view_Summaries(self).show();
              break;
            case "plan":
              new view_Plan(self).show();
              break;
            case "backups":
              new view_Backups(self).show();
              break;
            case "settings":
              new view_Settings(self).show();
              break;
            default:
              throw("Page '" + conf.page() + "' is unknown");
            }
          })
        });
      } else {
        new user_Auth(self, self._client).show();
      }
    });
  }

  // server ----------------------------

  /**
   * @private
   * @param {function():void} f
   * @return {void}
   */
  sendConf (f) {
    const data = {"rq": "setConf", "conf": this.conf().serialize()};
    this._client.send(data, rp => { f(); });
  }

  /**
   * @private
   * @param {function():void} f
   * @return {void}
   */
  sendDb (f) {
    const data = {
      "rq": "setDb",
      "year": "" + this.conf().year(),
      "db": this.db().serialize()
    };
    this._client.send(data, rp => { f(); });
  }

  // menu ------------------------------

  /**
   * @return {void}
   */
  bye () {
    const self = this;
    const data = {"rq": "logout"};
    self._client.send(data, rp => { new view_Bye(self).show(); });
  }

  /**
   * @param {string} page
   * @return {void}
   */
  go (page) {
    const self = this;
    self.conf().setPage(page);
    self.sendConf(() => { self.run(); });
  }

  // year ------------------------------

  /**
   * @param {number} y
   * @return {void}
   */
  changeYear (y) {
    const self = this;
    self.conf().setYear(y);
    self.sendConf(() => { self.run(); });
  }

  /** @return {void} */
  closeYear () {
    const self = this;
    const year = self.conf().year();
    const closeEntry = self._db.close(year);
    self.db().setDiary([closeEntry]);
    const data = {
      "rq": "setDb",
      "year": "" + (year + 1),
      "db": self.db().serialize()
    };
    this._client.send(data, rp => {
      const ys = self.conf().years();
      ys.push(year + 1);
      self.conf().setYears(ys);
      self.conf().setYear(year + 1);
      self.sendConf(() => { self.run(); });
    });
  }

  // diary -----------------------------

  /**
   * Sets account for help in 'conf.db'.
   * @param {string} accId
   * @param {function ():void} f
   * @return {void}
   */
  setDiaryId (accId, f) {
    this.conf().diaryConf().setId(accId);
    this.sendConf(f);
  }

  /**
   * Sets index of position in diary list
   * @param {number} ix
   * @param {function():void} f
   * @return {void}
   */
  setDiaryIx (ix, f) {
    this.conf().diaryConf().setIx(ix);
    this.sendConf(f);
  }

  /**
   * Sets number of items in diary list
   * @param {number} len
   * @param {function():void} f
   * @return {void}
   */
  setDiaryListLen (len, f) {
    this.conf().diaryConf().setListLen(len);
    this.sendConf(f);
  }

  /**
   * @param {!db_Dentry} entry
   * @return {void}
   */
  addDentry (entry) {
    const self = this;
    self.conf().diaryConf().setIx(self.db().diaryAdd(entry));
    self.conf().cashConf().setIx(self.conf().diaryConf().ix());
    self.sendDb(() => {
      self.sendConf(() => { new view_Diary(self).show(); });
    });
  }

  /**
   * @param {number} ix Number of annotations (its order number is ix - 1)
   * @param {function():void} f
   * @return {void}
   */
  delDentry (ix, f) {
    const self = this;
    self.db().diaryDel(ix);
    self.sendDb(f);
  }

  /**
   * @param {number} ix Number of annotations (its order number is ix - 1)
   * @param {!db_Dentry} entry
   * @return {void}
   */
  modifyDentry (ix, entry) {
    const self = this;
    self.db().diaryModify(ix, entry);
    self.sendDb(() => { new view_Diary(self).show(); });
  }

  goToAcc (acc, lix) {
    const accsConf = this.conf().accsConf();
    accsConf.setId(acc);
    accsConf.setIx(lix);
    this.go("accs");
  }

  // cash ------------------------------

  /**
   * Shorcuts for annotations
   * @return {Object<string, Array<string>>} Returns an object[account,
   *   [description, ammount] with usual descriptions and ammounts for
   *   and account. If there are not any usual description or ammount, their
   *   array value is "".
   */
  shortCuts () {
    /** @type {Object<string, !Tp3<number, !Object<string, number>, !Object<string, number>>>} */
    const shdiary = {};
    It.from(this._db.diary()).each(e => {
      It.from(e.debits())
        .map(d => [d.e1(),  new Dec(-d.e2().value(), 2), e.description()]).addIt(
          It.from(e.credits())
            .map(c => [c.e1(), c.e2(), e.description()])
      ).each(a => {
        let she = shdiary[a[0]];
        const val = this._dom.decToStr(a[1]);
        const des = a[2];
        if (she === undefined) {
          /** @type {Object<string, number>} */
          const descriptions = {};
          descriptions[des] = 1;
          /** @type {Object<string, number>} */
          const values = {};
          values[val] = 1;
          shdiary[a[0]] = new Tp3(1, descriptions, values);
        } else {
          let desN = she.e2()[des];
          if (desN === undefined) {
            desN = 1;
          } else {
            ++desN;
          }
          let vN = she.e3()[val];
          if (vN === undefined) {
            vN = 1;
          } else {
            ++vN;
          }
          she.setE1(she.e1() + 1);
          she.e2()[des] = desN;
          she.e3()[val] = vN;
        }
      })
    });

    const r = {};
    It.from(this._db.subaccounts()).each(acc => {
      const a = acc[0];
      const tp3 = shdiary[a];
      if (tp3 === undefined) {
        r[a] = ["", ""];
      } else {
        const n = tp3.e1() / 2;
        const descs = tp3.e2();
        const vs = tp3.e3();
        const desc = It.keys(descs).findFirst(k => descs[k] > n);
        const v = It.keys(vs).findFirst(k => vs[k] > n);
        r[a] = [desc === undefined ? "" : desc, v === undefined ? "" : v];
      }
    });
    return r;
  }

  /**
   * Sets account for help in 'conf.db'.
   * @param {string} accId
   * @param {function ():void} f
   * @return {void}
   */
  setCashId (accId, f) {
    this.conf().cashConf().setId(accId);
    this.sendConf(f);
  }

  /**
   * Sets index of position in cash list
   * @param {number} ix
   * @param {function():void} f
   * @return {void}
   */
  setCashIx (ix, f) {
    this.conf().cashConf().setIx(ix);
    this.sendConf(f);
  }

  /**
   * Sets number of items in cash list
   * @param {number} len
   * @param {function():void} f
   * @return {void}
   */
  setCashListLen (len, f) {
    this.conf().cashConf().setListLen(len);
    this.sendConf(f);
  }

  /**
   * @param {!db_Dentry} entry
   * @return {void}
   */
  addDentry2 (entry) {
    const self = this;
    self.conf().diaryConf().setIx(self.db().diaryAdd(entry));
    self.conf().cashConf().setIx(self.conf().diaryConf().ix());
    self.sendDb(() => {
      self.sendConf(() => { new view_Cash(self).show(); });
    });
  }

  /**
   * Sets index of position in diary list
   * @param {number} ix
   * @return {void}
   */
  goDiary (ix) {
    const self = this;
    self.conf().diaryConf().setIx(ix);
    this.sendConf(() => { new view_Diary(self).show(); });
  }

  // accs ------------------------------

  /**
   * Sets account in 'conf.db' and reload Accs page.
   * @param {string} accId
   * @return {void}
   */
  setAccsId (accId) {
    const self = this;
    self.conf().accsConf().setId(accId);
    self.conf().accsConf().setIx(0);
    self.sendConf(() => { new view_Accs(self).show(); });
  }

  /**
   * Sets index of position in Accs list
   * @param {number} ix
   * @param {function():void} f
   * @return {void}
   */
  setAccsIx (ix, f) {
    this.conf().accsConf().setIx(ix);
    this.sendConf(f);
  }

  /**
   * Sets number of items in Accs list
   * @param {number} len
   * @param {function():void} f
   * @return {void}
   */
  setAccsListLen (len, f) {
    this.conf().accsConf().setListLen(len);
    this.sendConf(f);
  }

  // summaries -------------------------

  /**
   * @param {string} op Summaries option
   */
  setSummary (op) {
    const self = this;
    self.conf().setSummary(op);
    self.sendConf(() => { new view_Summaries(self).show(); });
  }

  /**
   * Sets account in 'conf.db' and reload Accs page.
   * @param {string} accId
   * @return {void}
   */
  goAcc (accId) {
    const accsConf = this.conf().accsConf();
    accsConf.setId(accId);
    accsConf.setIx(0);
    this.go("accs");
  }


  // plan ------------------------------

  /**
   * @param {string} id
   * @return {void}
   */
  planGo (id) {
    const self = this;
    self.conf().setPlanId(id);
    self.sendConf(() => { self.run(); });
  }

  /**
   * Adds an entry to plan
   * @param {string} id
   * @param {string} description
   * @param {string=} summary
   * @return {void}
   */
  planAdd (id, description, summary) {
    const self = this;
    const db = self.db();
    const lg = id.length;
    switch (lg) {
      case 2:
        db.subgroupsAdd(id, description);
        break;
      case 3:
        if (summary === undefined) {
          throw("summary is undefined");
        }
        db.accountsAdd(id, description, summary);
        break;
      default:
         db.subaccountsAdd(id, description);
    }

    self.sendDb(() => {
      new view_Plan(self).show();
    });
  }

  /**
   * Adds an entry to plan
   * @param {string} modifyId
   * @param {string} id
   * @param {string} description
   * @param {string=} summary
   * @return {void}
   */
  planMod (modifyId, id, description, summary) {
    const self = this;
    const db = self.db();
    const lg = id.length;

    db.planChangeAcc(modifyId, id);

    switch (lg) {
      case 2:
        db.subgroupsMod(modifyId, id, description);
        break;
      case 3:
        if (summary === undefined) {
          throw("summary is undefined");
        }
        db.accountsMod(modifyId, id, description, summary);
        break;
      default:
         db.subaccountsMod(modifyId, id, description);
    }

    self.sendDb(() => {
      new view_Plan(self).show();
    });
  }

  /**
   * Deletes an entry in plan
   * @param {string} id
   * @return {void}
   */
  planDel (id) {
    const self = this;
    const db = self.db();
    const lg = id.length;
    switch (lg) {
      case 2:
        db.subgroupsDel(id);
        break;
      case 3:
        db.accountsDel(id);
        break;
      default:
         db.subaccountsDel(id);
    }

    self.sendDb(() => {
      new view_Plan(self).show();
    });
  }

  // backups ---------------------------

  /**
   * Downloads a backup
   * @param {function(string):void} action This callback passes the name of
   *  backup file.
   * @return {void}
   */
  backupDownload (action) {
    const data = {"rq": "backup"};
    this._client.send(data, rp => { action(rp["name"]); });
  }

  /**
   * Restores a backup
   * @param {*} file
   * @param {function(number):void} progress
   */
  backupRestore (file, progress) {
    const self = this;
    const step = 25000;
    let start = 0;

    const reader = new FileReader();
    reader.onerror/**/ = evt => {
      alert(_args(_("'%0' can not be read"), file.name/**/));
      const data = {"rq": "restoreAbort"};
      this._client.send(data, () => {
        new view_Backups(self).show();
      });
    }
    reader.onloadend/**/ = evt => {
      if (evt.target/**/.readyState/**/ === FileReader.DONE/**/) { // DONE == 2
        const bindata = new Uint8Array(evt.target/**/.result/**/);
        progress(start);
        if (bindata.length > 0) {
          const data = {
            "rq": "restoreAppend",
            "data": B64.encodeBytes(bindata)
          };
          this._client.send(data, rp => {
            start += step;
            var blob = file.slice(start, start + step);
            reader.readAsArrayBuffer(blob);
          });
        } else {
          progress(file.size/**/);
          const data = {"rq": "restoreEnd"};
          this._client.send(data, (rp) => {
            const fail = rp["fail"];
            if (fail === "restore:unzip") {
              alert(_("Fail unzipping backup"));
            } else if (fail === "restore:version") {
              alert(_("File is not a Hconta backup"));
            }
            self.run();
          });
        }
      }
    };

    function append() {
      var blob = file.slice(start, start + step);
      reader.readAsArrayBuffer(blob);
    }

    const data = {"rq": "restoreStart"};
    this._client.send(data, () => {
      append();
    });
  }

  /** @return {void} */
  clearTrash () {
    const self = this;
    const data = {"rq": "clearTrash"};
    this._client.send(data, () => {
      self.run();
    });
  }

  /**
   * @param {string} f
   * @return {void}
   */
  autorestore (f) {
    const self = this;
    const data = {"rq": "autorestore", "file": f};
    this._client.send(data, () => {
      self.run();
    });
  }

  /**
   * @param {string} f
   * @return {void}
   */
  restoreTrash (f) {
    const self = this;
    const data = {"rq": "restoreTrash", "file": f};
    this._client.send(data, () => {
      self.run();
    });
  }

  // settings --------------------------

  /**
   * @return {void}
   */
  changeLang () {
    const self = this;
    self.conf().setLanguage(self.conf().language() === "es" ? "en" : "es");
    self.sendConf(() => { self.run(); });
  }

  /**
   * @return {void}
   */
  changePassPage () {
    new user_Chpass(this).show();
  }

  /**
   * @param {string} pass
   * @param {string} newPass
   * @param {function(boolean):void} f Function to manage captcha counter.
   * @return {void}
   */
  changePass (pass, newPass, f) {
    const self = this;
    const data = {
      "rq": "chpass",
      "user": "admin",
      "pass": Client.crypPass(pass),
      "newPass": Client.crypPass(newPass)
    };
    self._client.send(data, rp => {
      const ok = rp["ok"];
      f(ok);
      if (ok) {
        alert(_("Password successfully changed"));
        self.run();
      } else {
        self.changePassPage();
      }
    });
  }

}
new Main().run();

