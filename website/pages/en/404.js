const React = require("react");
const siteConfig = require(`${process.cwd()}/siteConfig.js`);

class ErrorPage extends React.Component {
  getTrackingScript() {
    if (!siteConfig.gaTrackingId) {
      return null;
    }

    return {__html:`
      ga('create', "${siteConfig.gaTrackingId}");
      ga('send', {
        hitType: 'event',
        eventCategory: '404 Response',
        eventAction: window.location.href,
        eventLabel: document.referrer
      });`
    }
  }

  render() {
    const trackingScript = this.getTrackingScript();

    return (
      <div className="error-page">
      {trackingScript && <script dangerouslySetInnerHTML={trackingScript}/>}
        <div className="error-message">
          <div className=" error-message-container container">
            <span>404 </span>
            <p>Page Not Found.</p>
            <a href="/">Return to the front page</a>
          </div>
        </div>
      </div>
    );
  }
}

ErrorPage.title = "Page Not Found"


module.exports = ErrorPage;
