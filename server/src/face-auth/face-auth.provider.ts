import { REPOSITORY } from '../common/constants/app.constants';
import { FaceData } from './entities/face-data.entity';

export const faceAuthProviders = [
  {
    provide: REPOSITORY.FACE_DATA,
    useValue: FaceData,
  },
];
