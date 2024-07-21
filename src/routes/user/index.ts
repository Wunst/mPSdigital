import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { SpecialParentalConsent } from "../../entity/specialParentalConsent";
import { userRoles } from "../../middleware/auth"
import { hashPassword } from "../../utils/hashPassword";
import { Or, IsNull, MoreThan } from "typeorm";
import { Student } from "../../entity/student";
import bcrypt from 'bcrypt';
import { Group } from "../../entity/group";

const router = express.Router()

// POST /user/:username - create user
router.post("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
    body: z.object({
        role: z.nativeEnum(Role),
        form: z.string(),
    // todo: student with no form possible
    }).partial({form: true})
}), async(req, res) => {

    // Not allowed to create new user
    if((req.user.role == Role.teacher && !(req.body.role == Role.student))) {
        res.status(403).end();
        return;
    }
    
    const user = await User.findOneBy({ username: req.params.username});
    // User already exist
    if(user){
        res.status(409).send('User exists').end();
        return;
    }

    await User.insert({
        username: req.params.username,
        password: await hashPassword(req.params.username),
        role: req.body.role,
    });

    if (req.body.role === Role.student) {
        await Student.insert({
            user: (await User.findOneBy({ username: req.params.username }))!,
            generalParentalConsent: false,
            form: req.body.form,
        });
    }

    res.status(201).end();
})

// GET /user - List users
router.get("/", userRoles([Role.teacher, Role.admin]), async (req, res) => {
    res.status(200).json((await User.find({
        select: [ 'username' ] 
    })).map(u => u.username)).end()
})

// GET /user/:username - Get user info
router.get("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOne({
        relations: {
            student: { group: true },
        },
        where: {
            username: req.params.username,
        }
    })

    if (!user) {
        res.status(404).end()
        return
    }

    const specialParentalConsent = !!await SpecialParentalConsent.findOne({
        relations: {
            group: true, 
            student: true
        },
        where: {
            group: {
                endDate: Or(IsNull(), MoreThan(new Date()))
            },
            student: user.student
        }
    })

    res.status(200).json({
        username: user.username,
        role: user.role,
        form: user.student?.form.name,
        generalParentalConsent: user.student?.generalParentalConsent,
        specialParentalConsent: specialParentalConsent
    }).end()
})

// PATCH /user/:username - update user
router.patch("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
    body: z.object({
        username: z.string(),
        role: z.nativeEnum(Role),
        generalParentalConsent: z.boolean()
    }).partial(),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }
    
    await User.update({ 
        username: req.params.username 
    }, { 
        username: req.body.username,
        role: req.body.role,
        student: {
            generalParentalConsent: req.body.generalParentalConsent
        }
    })
    res.status(200).end()
})

// DELETE /user/:username - Delete user
router.delete("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }

    await User.delete({
        username: req.params.username,
    })
    res.status(200).end()
})

// POST /user/:username/passwordReset - Reset user password
router.post("/:username/passwordReset", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }

    await User.update({
        username: req.params.username,
    }, {
        password: await hashPassword(req.params.username),
        changedPassword: false,
    })
    res.status(200).end()
})

// POST /user/account/changePassword - change Password
router.post("/changePassword", validateRequest({
    body: z.object({
        old: z.string(),
        new: z.string(),
    })
}), async(req, res) => {

    // Check old password
    const authorized = await bcrypt.compare(req.body.old, req.user.password);
    if (!authorized) {
        res.status(403).end();
        return;
    }
    
    await User.update(
        { username: req.user.username },
        { password: await hashPassword(req.body.new), changedPassword: true }
    );

    res.status(200).end();
})

// GET /user/account - info about the loggedin user
router.get("/account", async (req, res) =>  {
    
    let group = null;
    if(req.user.role === Role.student) {
        group = await Group.findOne({relations:{student: { user: true }}, where: { endDate: Or(MoreThan(new Date()), IsNull()) , student: { user: { id: req.user.id } } } });
    }

    res.status(200).json({
        username: req.user.username,
        role: req.user.role,
        changedPassword: req.user.changedPassword,
        group: group?.id,
    }).end();
})

// GET /user/account/settings
router.get("/account/settings", async(req, res) => {
    res.type('json').send(req.user.settings).end();
})

// PUT /user/account/settings
router.put("/account/setting", async(req, res) => {
    const settings = JSON.stringify(req.body);
    if (!settings) {
        res.status(400).end();
        return;
    }

    User.update({ id: req.user.id }, { settings });

    res.status(200).end();
})

// POST /user/:username/login - login
router.post("/:username/login", validateRequest({
    params: z.object({
        username: z.string(),
    }),
    body: z.object({
        password: z.string(),
    })
}), async(req, res) => {

    const user = await User.findOneBy({ username: req.params.username});
    if (!user) {
        res.status(401).end();
        return;
    }

    const authorized = await bcrypt.compare(req.body.password, user.password);
    if (!authorized) {
        res.status(401).end();
        return;
    }

    req.session.regenerate(() => {
        req.session.userId = user.id;
        res.status(200).json({
            mustChangePassword: req.body.password === user.username
        }).end();
    });
})

// GET /user/logout - logout
router.get("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.status(200).end();
    });
})

export default router;

