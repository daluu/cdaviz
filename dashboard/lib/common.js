function getBaseUrl(){
  var port = window.location.port == "" ? "" : ":"+ window.location.port;
  var baseUrl = window.location.protocol + "//" + window.location.hostname + port;
  return baseUrl;
}