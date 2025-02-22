import { SetMetadata } from '@nestjs/common';

/**
 * Define um endpoint como público, ou seja, acessível sem autenticação.
 */
export const Public = () => SetMetadata('isPublic', true);
