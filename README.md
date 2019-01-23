This code exploits the [Magellan bug](https://blade.tencent.com/magellan/index_en.html) on 64-bit Chrome, on all versions of Ubuntu.

The exploit is built for [Chrome version v70.0.3538.77](https://chromereleases.googleblog.com/2018/10/stable-channel-update-for-desktop_24.html) from the Stable Release.

In order to demonstrate popping the calculator, Chrome should be run on the command-line with the *--no-sandbox* flag.

```sh
/opt/google/chrome/chrome --no-sandbox
```

Afterwards, open **test_poc.html** and press the **GO** button.

If the exploit fails, re-run the exploit on a new tab. Ways to improve reliability is discussed in the [blog post](https://blog.exodusintel.com/2019/01/22/exploiting-the-magellan-bug-on-64-bit-chrome-desktop).
