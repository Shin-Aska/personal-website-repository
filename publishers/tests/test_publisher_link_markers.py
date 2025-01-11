from publishers.base import Publisher


class StubPublisher(Publisher):
    def __init__(self) -> None:
        pass


def test_single_link_marker():
    publisher = StubPublisher()
    test_input: str = 'This is a [Test<sup>[1]</sup> (Google)](https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/) link'
    expected_output: str = 'This is a <a href="https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/">Test<sup>[1]</sup> (Google)</a> link'
    result: str = publisher._process_link_markers(test_input)
    assert result == expected_output

def test_multiple_link_markers():
    publisher = StubPublisher()
    test_input: str = 'This is a [Test<sup>[1]</sup>](https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/) link containing multiple URLS [Auto Tab Discard<sup>[2]</sup>](https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/) that should display properly [Auto Tab Discard<sup>[3]</sup>](https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/)'
    expected_output: str = 'This is a <a href="https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/">Test<sup>[1]</sup></a> link containing multiple URLS <a href="https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/">Auto Tab Discard<sup>[2]</sup></a> that should display properly <a href="https://addons.mozilla.org/en-US/firefox/addon/auto-tab-discard/">Auto Tab Discard<sup>[3]</sup></a>'
    result: str = publisher._process_link_markers(test_input)
    assert result == expected_output
