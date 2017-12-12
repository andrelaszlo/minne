This is Minne (name tbd).

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

