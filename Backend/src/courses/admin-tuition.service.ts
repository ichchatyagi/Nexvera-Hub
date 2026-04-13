import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import {
  AdminCreateTuitionClassDto,
  AdminUpdateTuitionClassDto,
  AdminCreateTuitionSubjectDto,
  AdminUpdateTuitionSubjectDto,
  AdminTuitionPublishDto,
  AdminAssignTuitionInstructorDto
} from './dto/admin-tuition.dto';
import { ProductType } from './dto/course.dto';

@Injectable()
export class AdminTuitionService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // ── Class-Level CRUD ──────────────────────────────────────────────

  async createClass(dto: AdminCreateTuitionClassDto) {
    const { class_level, boards_supported, tuition_pricing, ...courseData } = dto;
    const created = await this.courseModel.create({
      ...courseData,
      product_type: ProductType.TUITION,
      status: 'draft',
      tuition_meta: {
        class_level,
        boards_supported: boards_supported || [],
        pricing: tuition_pricing,
        subjects: [],
      },
      assigned_instructor_ids: [],
    } as any);
    return { success: true, data: created };
  }

  async updateClass(id: string, dto: AdminUpdateTuitionClassDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(id), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course) throw new NotFoundException('Tuition class not found');

    const { class_level, boards_supported, tuition_pricing, ...courseData } = dto;

    // Update base fields
    Object.assign(course, courseData);

    // Update tuition_meta fields safely without destroying subjects
    if (course.tuition_meta) {
      if (class_level !== undefined) course.tuition_meta.class_level = class_level;
      if (boards_supported !== undefined) course.tuition_meta.boards_supported = boards_supported;
      if (tuition_pricing !== undefined) course.tuition_meta.pricing = tuition_pricing as any;
    }

    await course.save();
    return { success: true, data: course };
  }

  async publishClass(id: string, publishDto: AdminTuitionPublishDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(id), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course) throw new NotFoundException('Tuition class not found');

    course.status = publishDto.status;
    if (publishDto.status === 'published') {
      course.published_at = new Date();
    }
    await course.save();
    return { success: true, data: course };
  }

  async deleteClass(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const course = await this.courseModel.findOneAndDelete({ 
      _id: new Types.ObjectId(id), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course) throw new NotFoundException('Tuition class not found');

    return { success: true, data: { deleted: true } };
  }

  // ── Subject-Level CRUD ──────────────────────────────────────────────

  async addSubject(classId: string, dto: AdminCreateTuitionSubjectDto) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course) throw new NotFoundException('Tuition class not found');
    if (!course.tuition_meta) throw new BadRequestException('Missing tuition meta');

    const newSubject = {
      subject_id: new Types.ObjectId(),
      name: dto.name,
      slug: dto.slug,
      short_description: dto.short_description,
      pricing: dto.pricing,
      status: 'draft',
      assigned_instructor_ids: [],
      syllabus: [],
    };

    course.tuition_meta.subjects.push(newSubject as any);
    await course.save();

    return { success: true, data: newSubject };
  }

  async updateSubject(classId: string, subjectId: string, dto: AdminUpdateTuitionSubjectDto) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course || !course.tuition_meta) throw new NotFoundException('Tuition class not found');

    const subject = course.tuition_meta.subjects.find(s => s.subject_id.toString() === subjectId);
    if (!subject) throw new NotFoundException('Subject not found in class');

    // Selectively update properties
    if (dto.name !== undefined) subject.name = dto.name;
    if (dto.slug !== undefined) subject.slug = dto.slug;
    if (dto.short_description !== undefined) subject.short_description = dto.short_description;
    if (dto.pricing !== undefined) subject.pricing = dto.pricing as any;

    await course.save();
    return { success: true, data: subject };
  }

  async removeSubject(classId: string, subjectId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course || !course.tuition_meta) throw new NotFoundException('Tuition class not found');

    const initialLength = course.tuition_meta.subjects.length;
    course.tuition_meta.subjects = course.tuition_meta.subjects.filter(
      s => s.subject_id.toString() !== subjectId
    );

    if (course.tuition_meta.subjects.length === initialLength) {
      throw new NotFoundException('Subject not found looking to delete');
    }

    await course.save();
    return { success: true, data: { deleted: true } };
  }

  async publishSubject(classId: string, subjectId: string, publishDto: AdminTuitionPublishDto) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');
    
    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course || !course.tuition_meta) throw new NotFoundException('Tuition class not found');

    const subject = course.tuition_meta.subjects.find(s => s.subject_id.toString() === subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    subject.status = publishDto.status;
    await course.save();

    return { success: true, data: subject };
  }

  // ── Instructor Assignment ──────────────────────────────────────────────

  async assignInstructor(classId: string, subjectId: string, dto: AdminAssignTuitionInstructorDto) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course || !course.tuition_meta) throw new NotFoundException('Tuition class not found');

    const subject = course.tuition_meta.subjects.find(s => s.subject_id.toString() === subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    if (!subject.assigned_instructor_ids) {
      subject.assigned_instructor_ids = [];
    }

    if (!subject.assigned_instructor_ids.includes(dto.instructor_id)) {
      subject.assigned_instructor_ids.push(dto.instructor_id);
    }

    if (dto.is_lead) {
      subject.lead_instructor_id = dto.instructor_id;
    }

    await course.save();
    return { success: true, data: subject };
  }

  async unassignInstructor(classId: string, subjectId: string, instructorId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Invalid class ID');
    if (!Types.ObjectId.isValid(subjectId)) throw new BadRequestException('Invalid subject ID');

    const course = await this.courseModel.findOne({ 
      _id: new Types.ObjectId(classId), 
      product_type: ProductType.TUITION 
    }).exec();

    if (!course || !course.tuition_meta) throw new NotFoundException('Tuition class not found');

    const subject = course.tuition_meta.subjects.find(s => s.subject_id.toString() === subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    if (subject.assigned_instructor_ids) {
      subject.assigned_instructor_ids = subject.assigned_instructor_ids.filter(id => id !== instructorId);
    }

    if (subject.lead_instructor_id === instructorId) {
      subject.lead_instructor_id = undefined;
    }

    await course.save();
    return { success: true, data: subject };
  }
}
