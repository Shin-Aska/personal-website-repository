from parsers.markdown.tokenizer import MarkdownTokenizer, MarkdownToken
from parsers.markdown.constants import MarkdownElementType

# Read a file and store it to the variable content
with open('test.md', 'r') as file:
    content = file.read()

tokenizer = MarkdownTokenizer()
tokens = tokenizer.tokenize(content)

print(f"Total tokens: {len(tokens)}")
print("\nToken details:")
print("-" * 80)

def format_token_content(token, indent=0):
    """Format token content for display, handling nested tokens"""
    indent_str = "  " * indent

    if isinstance(token.content, list):
        # For nested tokens, recursively format each token
        result = f"{indent_str}[Nested tokens: {len(token.content)}]"
        for nested_token in token.content:
            result += f"\n{indent_str}- Type: {nested_token.value}\n"
            result += f"{indent_str}  Content: {format_token_content(nested_token, indent+2)}"
        return result
    else:
        # For string content, truncate if too long
        content_str = str(token.content)
        if len(content_str) > 50:
            return f"{content_str[:47]}..."
        return content_str

# Helper function to print the full token structure
def print_token_structure(token, indent=0):
    """Print the full structure of a token, including all nested tokens"""
    indent_str = "  " * indent
    print(f"{indent_str}Type: {token.value}")

    if isinstance(token.content, list):
        print(f"{indent_str}Content: [Nested tokens: {len(token.content)}]")
        for nested_token in token.content:
            print_token_structure(nested_token, indent + 1)
    else:
        content_str = str(token.content)
        if len(content_str) > 100:
            print(f"{indent_str}Content: {content_str[:97]}...")
        else:
            print(f"{indent_str}Content: {content_str}")

for i, token in enumerate(tokens):
    # Print token details
    print(f"{i+1}. Type: {token.value}")

    # Format and print content
    content_display = format_token_content(token)
    print(f"   Content: {content_display}")

    # Print additional info for specific token types
    if token.value == MarkdownElementType.p and isinstance(token.content, str):
        print(f"   Paragraph length: {len(token.content)} characters")
    elif token.value == MarkdownElementType.new_line:
        print(f"   Empty line (paragraph separator)")

    # For the problematic checkbox token (token #3), print the full structure
    if i == 2 and token.value == MarkdownElementType.checkbox:
        print("\n   Full token structure:")
        print_token_structure(token, indent=1)

    print("-" * 80)
