import { GraphQLError } from 'graphql';
import { ValidationPipe, ValidationError } from '@nestjs/common';

export const GraphQLValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (validationErrors: ValidationError[]) => {
    const formattedErrors = {};

    validationErrors.forEach((error) => {
      if (error.constraints) {
        const constraintsKeys = Object.keys(error.constraints);
        formattedErrors[error.property] = error.constraints[constraintsKeys[0]];
      }
    });

    return new GraphQLError('Bad Request Exception', {
      extensions: {
        statusCode: 400,
        errors: formattedErrors,
      },
    });
  },
});
