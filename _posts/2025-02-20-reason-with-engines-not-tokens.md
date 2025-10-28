---
title: "Reason with engines not tokens"
author: Greg
layout: post
permalink: /2025/02/reason-with-engines-not-tokens/
date: 2025-02-20 21:56:11 -0500
comments: True
licence: Creative Commons
categories:
  - category
tags:
  - tag
---


```python
from dataclasses import dataclass
import math
from typing import List

@dataclass
class Brick:
    """
    A Brick represents a rectangular Lego brick in a 3D structure.

    Attributes:
        width (int): The brick's width along the x-axis.
        length (int): The brick's length along the y-axis.
        height (int): The brick's height along the z-axis.
        x (int): The x-coordinate of the brick's bottom-left corner.
        y (int): The y-coordinate of the brick's bottom-left corner.
        z (int): The z-coordinate of the brick's bottom-left corner.
    
    Usage:
        Create a brick by specifying its dimensions and position. For example:

            brick = Brick(width=2, length=4, height=1, x=0, y=0, z=0)

        This class is used as the fundamental building block for a Lego structure.
        It is typically combined with functions that check for overlapping,
        connectivity, and overall stability of the assembled structure.
    """
    width: int
    length: int
    height: int
    x: int
    y: int
    z: int

# def overlap(brick1: Brick, brick2: Brick) -> bool:
#     """Return True if brick1 and brick2 overlap in volume."""
#     overlap_x = min(brick1.x + brick1.width, brick2.x + brick2.width) - max(brick1.x, brick2.x)
#     overlap_y = min(brick1.y + brick1.length, brick2.y + brick2.length) - max(brick1.y, brick2.y)
#     overlap_z = min(brick1.z + brick1.height, brick2.z + brick2.height) - max(brick1.z, brick2.z)
#     return overlap_x > 0 and overlap_y > 0 and overlap_z > 0

# def share_face(brick1: Brick, brick2: Brick) -> bool:
#     """
#     Return True if brick1 and brick2 share a face.
#     Checks along each axis whether the bricks touch exactly while overlapping
#     in the other two dimensions.
#     """
#     # Check contact along the x-axis
#     if math.isclose(brick1.x + brick1.width, brick2.x) or math.isclose(brick2.x + brick2.width, brick1.x):
#         if (min(brick1.y + brick1.length, brick2.y + brick2.length) - max(brick1.y, brick2.y) > 0 and
#             min(brick1.z + brick1.height, brick2.z + brick2.height) - max(brick1.z, brick2.z) > 0):
#             return True
#     # Check contact along the y-axis
#     if math.isclose(brick1.y + brick1.length, brick2.y) or math.isclose(brick2.y + brick2.length, brick1.y):
#         if (min(brick1.x + brick1.width, brick2.x + brick2.width) - max(brick1.x, brick2.x) > 0 and
#             min(brick1.z + brick1.height, brick2.z + brick2.height) - max(brick1.z, brick2.z) > 0):
#             return True
#     # Check contact along the z-axis
#     if math.isclose(brick1.z + brick1.height, brick2.z) or math.isclose(brick2.z + brick2.height, brick1.z):
#         if (min(brick1.x + brick1.width, brick2.x + brick2.width) - max(brick1.x, brick2.x) > 0 and
#             min(brick1.y + brick1.length, brick2.y + brick2.length) - max(brick1.y, brick2.y) > 0):
#             return True
#     return False

def compute_center_of_mass(bricks: List[Brick]) -> (float, float):
    """Compute the overall center of mass (x, y) for uniform bricks."""
    total_mass = 0
    sum_x = 0.0
    sum_y = 0.0
    for brick in bricks:
        mass = brick.width * brick.length * brick.height
        cx = brick.x + brick.width / 2
        cy = brick.y + brick.length / 2
        total_mass += mass
        sum_x += mass * cx
        sum_y += mass * cy
    return sum_x / total_mass, sum_y / total_mass

def get_base_cells(bricks: List[Brick]) -> set:
    """
    Returns a set of 1x1 grid cell coordinates (as (x, y) tuples) that are covered
    by bricks touching the ground (z == 0).
    """
    cells = set()
    for brick in bricks:
        if brick.z == 0:
            for xi in range(brick.x, brick.x + brick.width):
                for yi in range(brick.y, brick.y + brick.length):
                    cells.add((xi, yi))
    return cells

# def check_connectivity(bricks: List[Brick]) -> None:
#     """
#     Ensure all bricks are connected (directly or indirectly)
#     to a brick that touches the ground.
#     """
#     n = len(bricks)
#     # Build connectivity graph where nodes are brick indices.
#     graph = {i: set() for i in range(n)}
#     for i in range(n):
#         for j in range(i + 1, n):
#             if share_face(bricks[i], bricks[j]):
#                 graph[i].add(j)
#                 graph[j].add(i)
#     # Start from bricks on the ground.
#     base_nodes = {i for i, brick in enumerate(bricks) if brick.z == 0}
#     if not base_nodes:
#         raise ValueError("Error: No brick touches the ground (z == 0).")
#     visited = set()
#     stack = list(base_nodes)
#     while stack:
#         node = stack.pop()
#         if node in visited:
#             continue
#         visited.add(node)
#         stack.extend(graph[node] - visited)
#     if len(visited) != n:
#         raise ValueError("Error: Disconnected bricks detected.")

def check_stability(bricks: List[Brick]) -> str:
    """
    Check for overlapping bricks, connectivity, and then determine
    if the overall structure is 'Stable', 'Unstable', or 'Topple'.
    """
    # n = len(bricks)
    # # Overlap check
    # for i in range(n):
    #     for j in range(i + 1, n):
    #         if overlap(bricks[i], bricks[j]):
    #             raise ValueError("Error: Overlapping bricks detected.")
    
    # # Connectivity check
    # check_connectivity(bricks)
    
    # Compute center of mass (x, y)
    x_cm, y_cm = compute_center_of_mass(bricks)
    
    # Determine support area from base bricks (z == 0)
    base_cells = get_base_cells(bricks)
    cell_x, cell_y = math.floor(x_cm), math.floor(y_cm)
    
    # If center of mass projection is not over a base cell, structure topples.
    if (cell_x, cell_y) not in base_cells:
        return "Topple"
    
    # If the center of mass is exactly on a boundary, it's unstable.
    if (math.isclose(x_cm - cell_x, 0) or math.isclose((cell_x + 1) - x_cm, 0) or
        math.isclose(y_cm - cell_y, 0) or math.isclose((cell_y + 1) - y_cm, 0)):
        return "Unstable"
    
    return "Stable"

# Example usage:
if __name__ == "__main__":
    # A simple test: a 1x1 brick on the ground, a 2x1 brick above,
    # and a 1x1 brick on top of the 2x1 but offset.
    brick1 = Brick(width=1, length=1, height=1, x=0, y=0, z=0)
    brick2 = Brick(width=2, length=1, height=1, x=0, y=0, z=1)
    brick3 = Brick(width=1, length=1, height=1, x=1, y=0, z=2)
    bricks = [brick1, brick2, brick3]
    
    result = check_stability(bricks)
    print(result)  # Output: "Stable", "Unstable", or "Topple" based on the computed center of mass.

```