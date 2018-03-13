This is Minne (name tbd).

Minne is a helpful and easier-to-use calendar that provides you with:

* All your events, to-dos and notes in one place
* Easy overview of your free time
* Daily reminder of your weekly goals

On Android, you can [download the app here][https://rink.hockeyapp.net/apps/09e9a38ac0de43d596e45fdaa31687fe].

On iPhone, or if you don't want to install an app, you can [use the web version here][https://minne.linkely.co/].

## Setup

After checkout, install the git hooks:

```
./install-hooks.sh
```

## Build

To build a signed apk (for release in HockeyApp, for example):

```
ionic cordova build --prod --release android -- -- --keystore=calico.keystore --alias=minne
```

The password is secret, but you can probably guess it ;)

## Configure

Make sure to configure the function environment

```
firebase functions:config:set \
  google.client_id="CLIENT_ID" \
  google.client_secret="CLIENT_SECRET" \
  google.redirect_url="https://example.firebaseapp.com/__/auth/handler"
```

## Deploy

To deploy both functions and to https://minne.linkely.co

```
firebase deploy
```

If you only want to deploy functions

```
firebase deploy --only functions
```

Make sure dependencies are installed first, since functions need to compile Typescript.

```
cd functions
npm install
```

