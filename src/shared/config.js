window.rallyExtension = window.rallyExtension || {};
window.rallyExtension.config = {
  defaultUserConf: {
    injectionInterval : 4000,
    checkMarkFadeAwayDelay : 2000,
    simpleClickAction: 'url',
    doubleClickAction: 'key'
  },
  confLoaded: false,
  userConf:{},
  get: function() {
    return this.userConf;
  },
  set: function(confToSave) {
    if(!confToSave || !Object.keys(confToSave).length){
      console.error("Trying to save to sync storage an empty config")
      return;
    }
    chrome.storage.sync.set({
      userConf: confToSave
    }, function() {
      console.log("[config] New config sync'ed: ", confToSave);
    })
  },
  getDefault: function() {
    return this.defaultUserConf;
  },
  initConfig: function() {
    var loadedEvent = new Event('rallyExt-configLoaded')
      , consoleMsg
      ;
    chrome.storage.sync.get(["userConf"], function(detail){
      // There is an existing userConf
      if(detail.userConf) {
        this.userConf= detail.userConf;
        var syncConfKeys = Object.keys(this.userConf)
          , defaultConfKeys = Object.keys(this.getDefault())
          ;
          
        // @TODO Only test is new settings. Need to test if missing or replaced
        if(syncConfKeys.length !== defaultConfKeys.length){
          console.log('user',this.userConf,'defaut',this.getDefault());
          var defaults = _.partialRight(_.assign, function(value, other) {
            return _.isUndefined(value) ? other : value;
          });
          defaults(this.userConf,this.getDefault());
          console.log('user',this.userConf,'defaut',this.getDefault());
          chrome.storage.sync.set({
            userConf:this.userConf
          },function(e) {
            console.warn("A new setting has been created in this package and will be added to your sync'ed settings",e)
          });
        }
      } else { // No existing (synced User Conf)
        this.userConf = JSON.parse(JSON.stringify(this.getDefault()));
        chrome.storage.sync.set({
          userConf:this.userConf
        },function() {
          console.warn("Didn't find any user configuration in sync storage, added default one")
        });
      }
      document.dispatchEvent(loadedEvent);
      this.confLoaded = true;
    }.bind(this));
  }
}
window.rallyExtension.config.initConfig();