export default function download(data, name) {
  // Some downloader code
  var pom = document.createElement('a');
  pom.setAttribute('href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
  );
  pom.setAttribute('download', name);
  if (document.createEvent) {
    let event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}
