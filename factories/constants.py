from publishers.classic import ClassicThemePublisher
from publishers.default import DefaultThemePublisher

publisher_to_template_mapping = {
    'default.html': DefaultThemePublisher,
    'classic.html': ClassicThemePublisher
}
