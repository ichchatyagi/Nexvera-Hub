import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CoursesService } from './src/courses/courses.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const courseModel = (coursesService as any).courseModel;

  const teacherId = '118d66db-8816-4f79-ba86-493686c98d67';

  console.log(`Assigning instructor ${teacherId} to all courses and tuition subjects...`);

  // Update regular courses
  const coursesResult = await courseModel.updateMany(
    { product_type: { $ne: 'tuition' } },
    { $set: { lead_instructor_id: teacherId } }
  );
  console.log(`Updated ${coursesResult.modifiedCount} regular courses.`);

  // Update tuition subjects
  const tuitions = await courseModel.find({ product_type: 'tuition' });
  let count = 0;
  for (const t of tuitions) {
    if (t.tuition_meta && t.tuition_meta.subjects) {
      t.tuition_meta.subjects.forEach(s => {
        s.lead_instructor_id = teacherId;
        if (!s.assigned_instructor_ids) s.assigned_instructor_ids = [];
        if (!s.assigned_instructor_ids.includes(teacherId)) {
          s.assigned_instructor_ids.push(teacherId);
        }
      });
      t.markModified('tuition_meta.subjects');
      await t.save();
      count++;
    }
  }
  console.log(`Updated ${count} tuition classes (with all their subjects).`);

  await app.close();
  process.exit(0);
}

bootstrap();
