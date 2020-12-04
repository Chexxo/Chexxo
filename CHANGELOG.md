# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
