from parsers.markdown.constants import MarkdownElementType
from parsers.markdown.models import MarkdownElement
from publishers.base import Publisher


class StubPublisher(Publisher):
    def __init__(self) -> None:
        self.images = []


def test_simple_table():
    """Test a simple 2-column table with header and 2 body rows."""
    publisher = StubPublisher()
    # Create a table element with header + separator + 2 body rows
    element = MarkdownElement(
        MarkdownElementType.table,
        ['| Header 1 | Header 2 |', '|---|---|', '| Cell 1 | Cell 2 |', '| Cell 3 | Cell 4 |']
    )
    html_content = publisher._generate_table_content('', element)
    
    # Verify structure
    assert '<div class="article-table-wrap" role="region" aria-label="Scrollable data table" tabindex="0">' in html_content
    assert '<table class="article-table">' in html_content
    assert '</table>' in html_content
    assert '</div>' in html_content
    assert '<thead>' in html_content
    assert '</thead>' in html_content
    assert '<tbody>' in html_content
    assert '</tbody>' in html_content
    assert '<th scope="col">Header 1</th>' in html_content
    assert '<th scope="col">Header 2</th>' in html_content
    assert '<td data-label="Header 1">Cell 1</td>' in html_content
    assert '<td data-label="Header 2">Cell 2</td>' in html_content
    assert '<td data-label="Header 1">Cell 3</td>' in html_content
    assert '<td data-label="Header 2">Cell 4</td>' in html_content


def test_table_with_bold_italic():
    """Test that bold and italic markers in cells are converted to HTML."""
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        ['| Name | Description |', '|---|---|', '| **Bold** | *Italic* |']
    )
    html_content = publisher._generate_table_content('', element)
    
    # Body cells should have bold and italic converted
    assert '<td data-label="Name"><b>Bold</b></td>' in html_content
    assert '<td data-label="Description"><i>Italic</i></td>' in html_content


def test_table_with_inline_links():
    """Test that inline links in cells are converted to HTML."""
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        ['| Link |', '|---|', '| [Google](https://google.com) |']
    )
    html_content = publisher._generate_table_content('', element)
    
    assert '<a href="https://google.com">Google</a>' in html_content


def test_single_row_table():
    """Test a table with header only (no body rows)."""
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        ['| Header 1 | Header 2 |', '|---|---|']
    )
    html_content = publisher._generate_table_content('', element)
    
    # Should have thead but no tbody (since there are no body rows)
    assert '<thead>' in html_content
    assert '<th scope="col">Header 1</th>' in html_content
    assert '<th scope="col">Header 2</th>' in html_content
    # tbody is optional when there are no body rows


def test_empty_cells():
    """Test that empty cells are rendered as empty tags."""
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        ['| A | B | C |', '|---|---|---|', '| 1 | | 3 |']
    )
    html_content = publisher._generate_table_content('', element)
    
    # Should have 3 td cells in the body row, middle one empty
    assert '<td data-label="A">1</td>' in html_content
    assert '<td data-label="C">3</td>' in html_content
    # Check we have exactly 3 cells in the row (1, empty, 3)
    # The empty cell will be <td></td>
    row_start = html_content.find('<td data-label="A">1</td>')
    row_end = html_content.find('</tr>', row_start)
    row_content = html_content[row_start:row_end]
    # Should contain 3 td cells (1, empty, 3)
    assert row_content.count('<td data-label=') == 3
    assert '<td data-label="B"></td>' in row_content  # empty cell


def test_responsive_labels_are_plain_and_attribute_safe():
    """Header formatting should not leak markup into mobile data labels."""
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        [
            '| **Project** | [Status](https://example.com/?a=1&b=2) |',
            '|---|---|',
            '| Site | Ready |',
        ],
    )

    html_content = publisher._generate_table_content('', element)

    assert '<td data-label="Project">Site</td>' in html_content
    assert '<td data-label="Status">Ready</td>' in html_content


def test_expandable_column_directive_adds_progressive_enhancement_metadata():
    publisher = StubPublisher()
    element = MarkdownElement(
        MarkdownElementType.table,
        [
            '| Game | Link | Description | Preview |',
            '|---|---|---|---|',
            '| One | [Play](https://example.com) | Details | ![](images/one.png) |',
        ],
    )

    options = publisher._parse_table_directive(
        '<!-- table: expand=Description, Preview; toggle=Game -->'
    )
    html_content = publisher._generate_table_content('', element, options=options)

    assert 'data-expand-columns="2,3"' in html_content
    assert 'data-toggle-column="0"' in html_content
    assert '<img class="article-table-image" src="images/one.png"' in html_content
    assert 'articles/images/one.png' in publisher.images


def test_unrelated_comment_is_not_a_table_directive():
    assert StubPublisher._parse_table_directive('<!-- ordinary comment -->') is None
