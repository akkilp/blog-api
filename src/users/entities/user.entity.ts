import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  public password: string;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts: Post[];

  /*   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedDate: Date; */
}

export default User;
