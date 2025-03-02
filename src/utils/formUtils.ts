import { Form } from "../entity/form";

export async function formByName(name: string): Promise<Form | null> {
    return Form.findOneBy({
        name
    })
}
