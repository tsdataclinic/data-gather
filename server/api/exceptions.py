"""Module for storing custom API exceptions"""
from typing import List


class InvalidOrder(Exception):
    """Exception for when screens are out of order"""

    def __init__(self, proposed_order: int, current_orders: List[int]):
        self.message = (
            f"Proposed order of {proposed_order} is not in or "
            f"adjacent to list of current orders {current_orders}"
        )
        super().__init__(self.message)
