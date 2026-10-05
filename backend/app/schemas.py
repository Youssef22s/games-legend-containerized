from marshmallow import Schema, fields


class UserSchema(Schema):
    username = fields.Str(
        required=True, error_messages={"required": "Username is required."}
    )
    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )
    password = fields.Str(
        required=True, error_messages={"required": "Password is required."}
    )


user_schema = UserSchema()
