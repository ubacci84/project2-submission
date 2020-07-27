import { Router, Request, Response } from 'express';
import { ImagesRouter } from './images/routes/images.router';

const router: Router = Router();

router.use('/images', ImagesRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send("try GET /v0/filteredimage?image_url={{}}")
});

export const IndexRouter: Router = router;
