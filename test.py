from publishers.base import Publisher


txt =  "[Firefox](https://flathub.org/apps/org.mozilla.firefox) - The one best and most customizable browser. You can adjust Firefox's user interface via userChrome.css (same approach covered in the [Opening unlimited tabs with Firefox article<sup>[3]</sup>](https://www.richardorilla.website/firefox-unlimited-tabs-setup.html) last month). There is even a [listing of popular userChrome CSS themes<sup>[4]</sup>](https://trickypr.github.io/FirefoxCSS-Store.github.io/) themes but if you prefer other hacks such as tabs on bottom and alike, there is a [popular github repository<sup>[5]</sup>](https://github.com/MrOtherGuy/firefox-csshacks/tree/master/chrome) for that as well."

result = Publisher._process_link_markers(txt)
expected_result = '<a href="https://flathub.org/apps/org.mozilla.firefox">Firefox</a> - The one best and most customizable browser. You can adjust Firefox\'s user interface via userChrome.css (same approach covered in the <a href="https://www.richardorilla.website/firefox-unlimited-tabs-setup.html">Opening unlimited tabs with Firefox article<sup>[3]</sup></a> last month). There is even a <a href="https://trickypr.github.io/FirefoxCSS-Store.github.io/">listing of popular userChrome CSS themes<sup>[4]</sup></a> themes but if you prefer other hacks such as tabs on bottom and alike, there is a <a href="https://github.com/MrOtherGuy/firefox-csshacks/tree/master/chrome">popular github repository<sup>[5]</sup></a> for that as well.'


if result == expected_result:
    print("Test passed")
else:
    print("Test failed")