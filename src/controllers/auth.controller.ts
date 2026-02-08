import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { User } from '../interfaces/user.interface'
import { userModel } from '../models/user.model'
import { validateUserRegistrationInfo, validateUserLoginInfo } from '../validators/auth.validator'



export async function registerUser(req: Request, res: Response) {


    try {
        const { error } = validateUserRegistrationInfo(req.body)
        if (error) {
            res.status(400).json({
                error: error.details[0].message
            });
            return;
        }


        const emailExists = await userModel.findOne({email: req.body.email})

        if (emailExists) {
            res.status(400).json({
                error: "Email already exists"
            })
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(req.body.password, salt);

        const userObject = new userModel({
            username: req.body.username,
            email: req.body.email,
            password: passwordHashed
        })

        const savedUser = await userObject.save();
        res.status(201).json({ id: savedUser.id })
    }

    catch (error) {
        res.status(500).json({
            error: "Internal server error" + error
        });
    }

}


export async function loginUser(req: Request, res: Response) {
    try {
        const { error } = validateUserLoginInfo(req.body);
        if (error) {
            res.status(400).json({error: error.details[0].message});
            return;
        }


        const user: User | null = await userModel.findOne({ email: req.body.email })

        if (!user) {
            res.status(400).json({ error: "Email or password is wrong" });
            return;
        }
        else {
            const validPassword: boolean = await bcrypt.compare(req.body.password, user.password)
           
            if (!validPassword) {
                res.status(400).json({ error: "Email or password is wrong" })
                return;
            }

            const token: string = jwt.sign(
                { id: user.id, email: user.email, username: user.username },
                process.env.TOKEN_SECRET as string,
                { expiresIn: '2h' }
            );

            res.status(200)
              .header('Authorization', `Bearer ${token}`)
              .json({ token });

        }
    }

    catch (error) {
        res.status(500).json({error: "Error logging in user" + error})
    }

}


export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization') || req.header('auth-token');
    if (!authHeader) {
        res.status(401).json({ error: 'Access Denied' });
        return;
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as any;
        (req as any).user = decoded; // make user available to downstream handlers
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
}   