# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1] - 2020-12-15
### Added
- More unit tests.
- Better and more typedoc documentation.

## [0.6.0] - 2020-12-07
### Added
- Information regarding the different certificate qualities.

### Changed
- Improved Semantic UI import to be more effizient.
- Improved webpack build to be more effizient.
- Logo for certificate view.
- The chromium version now needs less permissions.

### Fixed
- Error with regex in CertificateParser which lead to an internal error message being exposed.
- Error which occured if no altname was defined on the certificate.
- Icon now shows up correctly even if multiple browser windows are opened.

## [0.5.0] - 2020-12-06
### Added
- Domain caching.
- Blocking function for domains where the certificate quality has decreased.

### Changed
- Improved `EventManager` to use promises.

## [0.4.0] - 2020-12-04
### Added
- Settings page to adjust extension settings.
- Logging for events happening within the extension.

## [0.3.0] - 2020-11-25
### Added
- Certificate errors are now beeing shown to the user.
- Implemented certificate view which allows the user to see certificate details.

### Changed
- Removed unused buttons from navigation.

### Fixed
- Fix error which occured on certain domains with a redirect.

## [0.2.0] - 2020-11-22
### Added
- Add server provider support and therefore support for chromium based browsers.

### Changed
- The backend now analyses raw certificates directly.

## [0.1.0] - 2020-11-08
### Added
- Add functionality to analyze Domain, Organization and Extended Validated Certificates in Mozilla Firefox.
