import { NextFunction, Request, Response } from 'express';
import { ErrorException } from '../error_handler/error-exception';
import { ErrorCode } from '../error_handler/error-code';
import { ItemPropertiesPatternService } from '../services/itemPropertiesPattern.service';

const itemPropertiesPatternService = new ItemPropertiesPatternService();

export async function saveItemPropertiesPattern(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const patternsReq = req.body;

  if (!Array.isArray(patternsReq)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant = res.locals.user.restaurant;

  // Separate new and existing patterns
  const newPatterns = patternsReq.filter((pattern) => !pattern.id);
  const patternsForUpdate = patternsReq.filter(
    (pattern) => pattern.id && !pattern.markAsDelete
  );
  const patternsForDelete = patternsReq.filter(
    (pattern) => pattern.id && pattern.markAsDelete
  );
  // Get all existing patterns for this restaurant
  const allRestaurantPatterns =
    await itemPropertiesPatternService.getEnabledPatterns(restaurant);

  // Check for duplicate titles
  const allPatternTitles = [
    ...allRestaurantPatterns.map((p) => p.propertyPatternTitle),
    ...newPatterns.map((p) => p.propertyPatternTitle),
  ];

  const uniqueTitles = new Set(allPatternTitles);
  if (uniqueTitles.size !== allPatternTitles.length) {
    return next(new ErrorException(ErrorCode.TitleAlreadyExists));
  }

  // Get IDs of patterns to delete
  const patternsForDeleteIds: number[] = patternsForDelete.map(
    (pattern) => pattern.id
  );

  await itemPropertiesPatternService.deletePatterns(patternsForDeleteIds);

  // Get IDs of patterns to update
  const patternsForUpdateIds = patternsForUpdate.map((pattern) => pattern.id);

  // Get existing patterns
  const existingPatterns = allRestaurantPatterns.filter((p) =>
    patternsForUpdateIds.includes(p.id)
  );

  // Create map for easy lookup
  const existingPatternsMap = new Map(
    existingPatterns.map((pattern) => [pattern.id, pattern])
  );

  // Process updates
  const patternsToUpdate = patternsForUpdate.map((updatedPattern) => {
    const existingPattern = existingPatternsMap.get(updatedPattern.id);

    if (!existingPattern) {
      throw new ErrorException(ErrorCode.BadRequestError);
    }

    return {
      ...existingPattern,
      ...updatedPattern,
      restaurant,
      itemProperties: updatedPattern.itemProperties,
    };
  });

  // Create new patterns
  const patternsToCreate = newPatterns.map((pattern) => ({
    ...pattern,
    restaurant,
    itemProperties: pattern.itemProperties,
  }));

  // Validate patterns belong to restaurant
  if (patternsForUpdateIds.length > 0) {
    const countPatterns = await itemPropertiesPatternService.countPatternsByIds(
      patternsForUpdateIds,
      restaurant
    );

    if (countPatterns !== patternsForUpdateIds.length) {
      return next(new ErrorException(ErrorCode.BadRequestError));
    }
  }

  // Save all patterns
  const allPatternsToSave = [...patternsToUpdate, ...patternsToCreate];

  try {
    // Save patterns
    const savedPatterns = await itemPropertiesPatternService.savePatterns(
      allPatternsToSave
    );

    // Get fresh data
    const updatedPatterns =
      await itemPropertiesPatternService.getEnabledPatterns(restaurant);

    res.json(updatedPatterns);
  } catch (error) {
    console.error('Error saving patterns:', error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
}

export async function getItemPropertiesPatterns(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant = res.locals.user.restaurant;

  try {
    const patterns = await itemPropertiesPatternService.getEnabledPatterns(
      restaurant
    );
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
}

export async function deleteItemPropertiesPattern(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const restaurant = res.locals.user.restaurant;

  try {
    const pattern = await itemPropertiesPatternService.getPatternById(
      parseInt(id),
      restaurant
    );

    if (!pattern) {
      return next(new ErrorException(ErrorCode.NotFound));
    }

    await itemPropertiesPatternService.savePatterns([pattern]);

    const updatedPatterns =
      await itemPropertiesPatternService.getEnabledPatterns(restaurant);
    res.json(updatedPatterns);
  } catch (error) {
    console.error('Error deleting pattern:', error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
}
