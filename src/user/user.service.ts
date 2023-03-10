import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/createUser.dto";
import { UserEntity } from "@app/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {sign} from 'jsonwebtoken'
import { JWT_SECRET } from "@app/config";
import { UserResponseInterface } from "@app/user/types/userResponse.interface";
import { LoginUserDto } from "@app/user/dto/loginUser.dto";
import {compare} from 'bcrypt'
import { UpdateUserDto } from "@app/user/dto/updateUser.dto";


@Injectable()
export class UserService {

  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({where: {email: createUserDto.email}})
    const userByUsername = await this.userRepository.findOne({where: {username: createUserDto.username}})
    if (userByEmail || userByUsername){
      throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const newUser = new UserEntity()
    Object.assign(newUser, createUserDto)
     return await this.userRepository.save(newUser)
  }
   findById(id: number): Promise<UserEntity>{
       return this.userRepository.findOne({where: {id}})
  }

  generateJwt(user: UserEntity): string{
      return sign({id: user.id, email: user.email, username: user.username}, JWT_SECRET)
  }

  buildUserResponse(user: UserEntity): UserResponseInterface{
      return {
        user: {
          ...user,
          token: this.generateJwt(user)
        }
      }
  }
  async login(loginUserDto: LoginUserDto): Promise<UserEntity>{
       const user = await this.userRepository.findOne({where:{email: loginUserDto.email}, select: ['id', 'username', 'email', 'bio', 'image', 'password']})
    if (!user){
      throw new HttpException('Credential are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const isPasswordCorrect = await compare(loginUserDto.password, user.password)
    if (!isPasswordCorrect){
      throw new HttpException('Credential are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    delete user.password
    return user
  }

  async updateUser(currentUserId: number, updateUserDto: UpdateUserDto): Promise<UserEntity>{
      const user = await this.findById(currentUserId)
    Object.assign(user, updateUserDto)
    return await this.userRepository.save(user)
  }

}
