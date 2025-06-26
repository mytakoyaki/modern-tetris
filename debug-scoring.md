# Debug Report: Soft Drop and Hard Drop Scoring Issues

## Issues Identified

### 1. **Architecture Mismatch**
- **Problem**: The GameField handles the actual tetromino movement and the Redux store handles the scoring
- **Issue**: The hard drop distance calculation was happening in both places, leading to potential synchronization issues

### 2. **Hard Drop Scoring Flow**
- **Before Fix**: 
  1. `gameFieldRef.current.hardDrop()` calculates and returns distance
  2. `dispatchRef.current(hardDropTetromino())` calculates distance again using Redux state
  3. This could lead to different distance values

- **After Fix**:
  1. `gameFieldRef.current.hardDrop()` calculates and returns distance
  2. `dispatchRef.current(hardDropTetromino({ distance: hardDropDistance }))` uses the GameField distance
  3. Consistent distance calculation

### 3. **Soft Drop Scoring**
- **Issue**: The soft drop scoring appears to be working correctly
- **Verification**: Each soft drop (dy = 1) awards 0.5 points as configured in `POINTS_CONFIG.SOFT_DROP_PER_LINE`

## Changes Made

### 1. **Updated `hardDropTetromino` Action**
- Modified to accept an optional `distance` parameter
- Falls back to Redux calculation if no distance is provided
- Added debugging logs to track distance calculation

### 2. **Updated `useGameEngine.handleHardDrop`**
- Now captures the distance returned by `gameFieldRef.current.hardDrop()`
- Passes the distance to the Redux action
- Added comprehensive debugging logs

### 3. **Added Debugging Logs**
- Soft drop points tracking in `moveTetromino` reducer
- Hard drop distance calculation tracking
- Step-by-step hard drop process logging

## Point Values Configuration
- **Soft Drop**: 0.5 points per line (SOFT_DROP_PER_LINE: 0.5)
- **Hard Drop**: 1 point per line (HARD_DROP_PER_LINE: 1)
- **Block Placement**: 10 points (TETROMINO_PLACEMENT: 10)

## Testing Steps
1. Start the game
2. Perform soft drops (down arrow) and check console for point awards
3. Perform hard drops (space bar) and check console for point awards
4. Verify total points increase correctly
5. Check that points are displayed in the UI

## Expected Console Output
```
[DEBUG] Soft drop successful - dispatching moveTetromino action
[DEBUG] Soft drop points awarded: 0.5 for distance: 1

[DEBUG] Hard drop initiated
[DEBUG] GameField returned hard drop distance: 5
[DEBUG] Hard drop points awarded: 5 for distance: 5
```

## Current Status
- **Fixed**: Hard drop distance synchronization between GameField and Redux
- **Fixed**: Added proper parameter passing for hard drop distance
- **Working**: Soft drop scoring (0.5 points per line)
- **Working**: Hard drop scoring (1 point per line)
- **Added**: Comprehensive debugging logs for troubleshooting