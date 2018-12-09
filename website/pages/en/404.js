const React = require("react");

class ErrorPage extends React.Component {
  render() {
    return (
      <div className="error-page">
        <div className="error-message">
          <div className=" error-message-container container">
            <span>404 </span>
            <p>Page Not Found.</p>
            <a href="/">Homepage</a>
          </div>
        </div>
      </div>
    );
  }
}

ErrorPage.title = "Page Not Found"


module.exports = ErrorPage;
