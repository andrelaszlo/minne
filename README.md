This is Minne (name tbd).

After checkout, install the git hooks:

```
./install-hooks.sh
```

To build a signed apk (for release in HockeyApp, for example):

```
ionic cordova build --prod --release android -- -- --keystore=calico.keystore --alias=minne
```

The password is secret, but you can probably guess it ;)