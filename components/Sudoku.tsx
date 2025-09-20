import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  getSettings,
  getStorageGamesData,
  getStorageUserData,
} from "../services/storage.services";
import { useSaveOnExit } from "../hooks/useSaveOnExit";
import {
  ActivityRegistration,
  addUserGameRegistration,
} from "../services/activityRegistrations.services";
import { emptyDateTime } from "../utils/date.utils";
import {
  colorGray,
  colorWhiteBackground,
  sudokuGameName,
} from "../constants/constants";
import { GamesData } from "../types/game";
import { GameWon } from "./GameWon";
import { GAME_STYLES } from "../constants/games.styles";
import { generateRandomNumberInInterval } from "../utils/utils";
import { BaseScreen } from "./BaseScreen";
import { ActivityRegistrationsContext } from "../contexts/activityRegistrationsContext";

// Type definitions
export type SudokuGrid = SudokuCell[][];
type Coordinates = { row: number; col: number };
// Calculate cell size
const { width } = Dimensions.get("window");
const gridSize = width - 20;
const cellSize = gridSize / 9;

export interface SudokuCell {
  value: number | null;
  expectedValue: number;
  editable: boolean;
  valid: boolean;
}

/**
 * Checks if placing the given number if the given position is a valid move according to sudoku rules.
 *
 * @param grid the Sudoku grid
 * @param number the number to check
 * @param pos the coordinates in the grid at which the number is trying to be placed
 * @returns a boolean indicating whether the action is valid
 */
const isValid = (grid: SudokuGrid, num: number, pos: Coordinates): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[pos.row][x].value === num && pos.col !== x) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][pos.col].value === num && pos.row !== x) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(pos.row / 3) * 3;
  const boxCol = Math.floor(pos.col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        grid[boxRow + i][boxCol + j].value === num &&
        pos.row !== boxRow + i &&
        pos.col !== boxCol + j
      )
        return false;
    }
  }

  return true;
};

/**
 * Fills every cell in the Sudoku grid.
 *
 * @param grid the Sudoku grid
 * @returns a boolean indicating whether the sudoku has been filled.
 */
function fillCells(grid: SudokuGrid): boolean {
  let row = 0;
  let col = 0;
  let isEmpty = false;

  for (let i = 0; i < 81; i++) {
    row = Math.floor(i / 9);
    col = i % 9;

    if (grid[row][col].value === null) {
      isEmpty = true;
      break;
    }
  }

  if (!isEmpty) return true;

  for (let num = 1; num <= 9; num++) {
    const randomNum = generateRandomNumberInInterval(1, 9);
    if (isValid(grid, randomNum, { row, col })) {
      grid[row][col].value = randomNum;
      grid[row][col].expectedValue = randomNum;
      if (fillCells(grid)) return true;
      grid[row][col].value = null;
    }
  }

  return false;
}

/**
 * Gets the saved sudoku grid or generates a new one.
 *
 * @returns the generated sudoku grid
 */
function generateSudoku(sudokuGameData: GamesData | undefined): SudokuGrid {
  let grid: SudokuGrid;

  if (!sudokuGameData || !sudokuGameData.data) {
    grid = Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => {
            return {
              value: null,
              expectedValue: -1,
              editable: false,
              valid: true,
            };
          }),
      );
    // Generate a solved Sudoku and then hide numbers to create a puzzle
    fillCells(grid);
    hideNumbers(grid);
  } else {
    grid = sudokuGameData.data as SudokuGrid;
  }

  return grid;
}

/**
 * Hides some cells from the grid to create a Sudoku puzzle.
 *
 * @param grid the Sudoku grid
 */
function hideNumbers(grid: SudokuGrid): void {
  const cellsToHide = generateRandomNumberInInterval(60, 70);

  for (let i = 0; i < cellsToHide; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    const cellToHide = grid[row][col];

    if (cellToHide.value !== null) {
      cellToHide.value = null;
      cellToHide.editable = true;
    }
  }
}

/**
 * Sudoku game component.
 */
export const SudokuGame = () => {
  const sudokuGameData: GamesData | undefined = getStorageGamesData()?.find(
    (data) => data.name === sudokuGameName,
  );
  const [grid, setGrid] = useState<SudokuGrid>(() =>
    generateSudoku(sudokuGameData),
  );
  const [selectedCell, setSelectedCell] = useState<Coordinates | null>(null);
  const [won, setWon] = useState<boolean>(
    sudokuGameData ? sudokuGameData.won : false,
  );
  useSaveOnExit({
    name: sudokuGameName,
    data: grid,
    won,
  });

  /**
   * @param row the row where the press action had place
   * @param the column where the press action had place
   */
  function handleCellPress(row: number, col: number): void {
    if (grid[row][col].editable) {
      setSelectedCell({ row, col });
    }
  }

  return !won ? (
    <BaseScreen>
      <View style={[GAME_STYLES.sudukuContainer]}>
        <View style={[GAME_STYLES.sudokuGrid]}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={GAME_STYLES.sudokuRow}>
              {row.map((cell, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    sudokuStyles.sudokuCell,
                    !(
                      selectedCell?.row === rowIndex &&
                      selectedCell?.col === colIndex
                    )
                      ? GAME_STYLES.sudokuNormalCell
                      : GAME_STYLES.sudokuSelectedCell,
                    (rowIndex + 1) % 3 === 0 && GAME_STYLES.sudokuBottomBorder,
                    (colIndex + 1) % 3 === 0 && GAME_STYLES.sudokuRightBorder,
                  ]}
                  onPressIn={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text
                    style={[
                      GAME_STYLES.sudoukuCellText,
                      grid[rowIndex][colIndex].valid
                        ? GAME_STYLES.sudokuValidCell
                        : GAME_STYLES.sudokuNotValidCell,
                    ]}
                  >
                    {cell.value || ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <NumberPad
          selectedCell={selectedCell}
          grid={grid}
          setGrid={setGrid}
          setSelectedCell={setSelectedCell}
          won={won}
          setWon={setWon}
        />
      </View>
    </BaseScreen>
  ) : (
    <GameWon />
  );
};

interface NumberPadProps {
  selectedCell: Coordinates | null;
  grid: SudokuGrid;
  setGrid: React.Dispatch<React.SetStateAction<SudokuGrid>>;
  setSelectedCell: React.Dispatch<React.SetStateAction<Coordinates | null>>;
  won: boolean;
  setWon: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * The NumberPad component.
 */
const NumberPad: React.FC<NumberPadProps> = ({
  selectedCell,
  grid,
  setGrid,
  setSelectedCell,
  won,
  setWon,
}) => {
  const activityRegistrationsContext = useContext(ActivityRegistrationsContext);
  /**
   * Handler function for
   */
  function handleNumberInput(num: number): void {
    if (!selectedCell) return;

    const newGrid = grid.map((rowArr) => rowArr.map((cell) => ({ ...cell })));
    const focusedCell = newGrid[selectedCell.row][selectedCell.col];

    focusedCell.value = num;

    if (focusedCell.value === focusedCell.expectedValue) {
      focusedCell.valid = true;
      focusedCell.editable = false;

      // Check if the puzzle is solved
      const isSolved = newGrid.every((row) =>
        row.every((cell) => cell.value !== null && cell.valid),
      );

      if (isSolved && !won) {
        const userSettings = getSettings();
        if (
          userSettings.general.enableOnlineFeatures &&
          activityRegistrationsContext
        ) {
          const currentDate = new Date();
          const userData = getStorageUserData();

          emptyDateTime(currentDate);
          addUserGameRegistration({
            gameName: sudokuGameName,
            registrationDate: currentDate.valueOf(),
            userId: userData.userId,
          })
            .then((savedGameRegistration) => {
              // Update context adding saved book registration
              const activityRegistrations: ActivityRegistration[] = [
                savedGameRegistration,
                ...activityRegistrationsContext.activityRegistrationsData
                  .activityRegistrations,
              ];
              activityRegistrationsContext.setActivityRegistrationsData({
                activityRegistrations,
                error: false,
              });
            })
            .catch(() => {
              activityRegistrationsContext.setActivityRegistrationsData({
                activityRegistrations: [],
                error: true,
              });
            });
        }
        setWon(true);
      }
    } else {
      focusedCell.valid = false;
    }

    setGrid(newGrid);
    setSelectedCell(null);
  }
  return (
    <View style={GAME_STYLES.sudokuNumberPad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <TouchableOpacity
          key={num}
          style={GAME_STYLES.sudokuNumberButton}
          onPressIn={() => handleNumberInput(num)}
        >
          <Text style={GAME_STYLES.sudokuNumberButtonText}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Styles that depend from local variables
const sudokuStyles = StyleSheet.create({
  sudokuCell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: colorGray,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorWhiteBackground,
  },
});
