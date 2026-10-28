from typing import Mapping, Sequence


def unique_reward_weights(
    weights: Mapping[str, float],
    available_items_by_outcome: Mapping[str, Sequence[str]],
    fallback_outcome: str = "coins_10",
) -> dict[str, float]:
    """Keep outcomes with unowned rewards and guarantee a safe fallback."""
    filtered = {
        outcome: weight
        for outcome, weight in weights.items()
        if weight > 0 and available_items_by_outcome.get(outcome)
    }
    return filtered or {fallback_outcome: 1.0}
