import { CldOgImage } from "next-cloudinary";
import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";

export default function MealsGrid({ meals }) {
  return (
    <ul className={classes.meals}>
      {meals.map((meal, index) => (
        <li key={index}>
          <MealItem {...meal} />
        </li>
      ))}
    </ul>
  );
}
