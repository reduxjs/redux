/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const docUrl = (doc, language, baseUrl) => `${baseUrl}${language ? `${language}/` : ""}${doc}`;

const Footer = ({ baseUrl, footerIcon, title, repoUrl, copyright }) => (
  <footer className="nav-footer" id="footer">
    <section className="sitemap">
      <a href={baseUrl} className="nav-home">
        {footerIcon && (
          <img
            src={baseUrl + footerIcon}
            alt={title}
            width="66"
            height="58"
          />
        )}
      </a>
      <div>
        <h5>Docs</h5>
        <a href={docUrl("introduction/getting-started")}>
          Getting Started
        </a>
        <a href={docUrl("introduction/core-concepts")}>
          Core Concepts
        </a>
        <a href={docUrl("basics/basic-tutorial")}>
          Basics
        </a>
        <a href={docUrl("advanced/advanced-tutorial")}>
          Advanced
        </a>
      </div>
      <div>
        <h5>Community</h5>
        <a
          href="http://stackoverflow.com/questions/tagged/redux"
          target="_blank"
          rel="noreferrer noopener"
        >
          Stack Overflow
        </a>
        <a href="https://discord.gg/0ZcbPKXt5bZ6au5t">
          Discord
        </a>
      </div>
      <div>
        <h5>More</h5>
        <a href="https://github.com/reduxjs/redux/">GitHub</a>
        <a
          className="github-button"
          href={repoUrl}
          data-icon="octicon-star"
          data-count-href="/reduxjs/redux/stargazers"
          data-show-count="true"
          data-count-aria-label="# stargazers on GitHub"
          aria-label="Star this project on GitHub"
        >
          Star
        </a>
      </div>
    </section>
    <section className="copyright">
      {copyright}<br />
      Some icons copyright <a
        href="https://fontawesome.com/license/free"
        style={{ color: "white" }}
      >
        Font Awesome
      </a> and <a
        href="https://thenounproject.com"
        style={{ color: "white" }}
      >
        Noun Project
      </a> (<a
        href="https://thenounproject.com/term/check/1870817/"
        style={{ color: "white" }}
      >
        Hassan ali
      </a>, <a
        href="https://thenounproject.com/term/debugging/1978252/"
        style={{ color: "white" }}
      >
        ProSymbols
      </a>)
    </section>
  </footer>
);

module.exports = Footer;
