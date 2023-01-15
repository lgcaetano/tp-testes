import {
  Delete,
  Get,
  Patch,
  Post,
  Controller,
  Body,
  Param,
} from '@nestjs/common';
import { User } from '../auth/decorator';
import { BookmarkService } from './bookmark.service';
import { EditBookmarkDto, CreateBookmarkDto } from './dto/bookmark.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UseGuards } from '@nestjs/common';

@Controller('bookmark')
@UseGuards(JwtGuard)
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@User('id') userId) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(@User('id') userId, @Param('id') bookmarkId) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(@User('id') userId, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  updateBookmarkById(
    @User('id') userId,
    @Param('id') bookmarkId,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmarkById(userId, bookmarkId, dto);
  }

  @Delete(':id')
  deleteBookmarkById(@User('id') userId, @Param('id') bookmarkId) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
