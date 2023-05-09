from unittest import TestCase

from server.models_util import snake_to_camel

class TestUtils(TestCase):
    """Tests for models utils functions"""

    def test_snake_to_camel(self):
        """Test that snake_to_camel returns correctly"""
        self.assertEqual("thisIsCamel", snake_to_camel("this_is_camel"))