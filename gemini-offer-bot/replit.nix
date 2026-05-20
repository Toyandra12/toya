{ pkgs }:
{
  deps = [
    # Python runtime
    pkgs.python311
    pkgs.python311Packages.pip

    # Headless Chromium + matching ChromeDriver
    pkgs.chromium
    pkgs.chromedriver

    # System libs required by Chromium in headless mode
    pkgs.xvfb-run          # virtual framebuffer (fallback if --headless=new isn't enough)
    pkgs.nss               # NSS crypto libs
    pkgs.atk              # accessibility toolkit
    pkgs.at-spi2-atk
    pkgs.at-spi2-core
    pkgs.cups
    pkgs.dbus
    pkgs.expat
    pkgs.fontconfig
    pkgs.freetype
    pkgs.gdk-pixbuf
    pkgs.glib
    pkgs.gtk3
    pkgs.libdrm
    pkgs.libX11
    pkgs.libXcomposite
    pkgs.libXdamage
    pkgs.libXext
    pkgs.libXfixes
    pkgs.libXrandr
    pkgs.libxcb
    pkgs.libxkbcommon
    pkgs.mesa
    pkgs.pango
    pkgs.alsa-lib
  ];
}
