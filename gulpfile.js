const imageminMozjpeg 	= require('imagemin-mozjpeg');				// Сжатие .jpg .png .svg с потерей качества
const autoprefixer 		= require('gulp-autoprefixer');				// Автопрефиксы для старых браузеров
const browserSync 		= require('browser-sync').create();			// Синфхронизация index.html с браузером	
const sourcemaps 		= require('gulp-sourcemaps');
const cleanCSS 			= require('gulp-clean-css');				// Сжатие .css
const imagemin 			= require('gulp-imagemin');					// Сжатие .jpg
const pngquant 			= require('imagemin-pngquant');				// Сжатие .png
const preproc 			= require('gulp-less');						// Трансляция .less файлов в .css
const uglify			= require('gulp-uglifyjs');					// Сжатие js файлов
const rename 			= require('gulp-rename');					// Переименовывать файлы
const concat			= require('gulp-concat');					// Конкатинировать несколько файлов
const cache 			= require('gulp-cache');					// Добавление в кэш файлов
const gcmq 				= require('gulp-group-css-media-queries');
const gulp 				= require('gulp');
const del				= require('del');							// Удаление дерикторий - файлов

let config = {
	release: {
		current: 	'./release',
		assets: 	'/assets/**/*',
		styles: 	'/assets/style',
		scripts: 	'/assets/js',
		images: 	'/assets/images',
		fonts: 		'/assets/fonts'
	},
	src:		'./src',
	css: {
		libs: 		'/preassets/style/libs/**/*.css',
		watch: 		'/preassets/style/**/*.less',
		src: 		'/preassets/style/style.less',
		dest: 		'/assets/style'
	},
	js: {
		src: 		'/preassets/script/**/*.js',
		main: 		'/preassets/script/main.js',
		dest: 		'/assets/script'
	},
	html:		'/*.html',
	img: {
		src: 		'/preassets/images/**/*',
		dest: 		'/assets/images/'
	},
	font: {
		src: '/preassets/fonts/**/*',
		dest: '/assets/fonts'
	}
}

gulp.task('styles', function(){
	console.log("Replacement: \nFrom:	" + config.src + config.css.src);
	console.log("To: 	" + config.src + config.css.dest);
	var maincss = gulp.src(config.src + config.css.src)
		.pipe(sourcemaps.init())
		.pipe(preproc())
		.pipe(gcmq())
		.pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(config.src + config.css.dest))	
	console.log("Creating libs.min.css");
	var libcss = gulp.src([config.src + config.css.libs])
		.pipe(concat('libs.min.css'))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(gulp.dest(config.src + config.css.dest))
})
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: config.src
        }
    });
});

gulp.task('scripts', function() {
	var libs = gulp.src(['!' + config.src + config.js.main, config.src + config.js.src])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.src + config.js.dest))
	var main = gulp.src(config.src + config.js.main)
		.pipe(uglify())
		.pipe(rename({suffix: '.min'})) 
		.pipe(gulp.dest(config.src + config.js.dest))
});

gulp.task('img-compress', function(){
	gulp.src(config.src + config.img.src)
        .pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
        .pipe(gulp.dest(config.src + config.img.dest))
})

gulp.task('high-img-compress', function(){
	gulp.src(config.src + config.img.src)
        .pipe(imagemin([
			imageminMozjpeg({
                quality: 50
            })
		]))
        .pipe(gulp.dest(config.src + config.img.dest))
})
gulp.task('clear-cache', function (callback) {
	return cache.clearAll();
})
gulp.task('fonts', function(){
	gulp.src(config.src + config.font.src)
		.pipe(gulp.dest(config.src + config.font.dest))
})
/////////////////////
gulp.task('watch', ['img-compress', 'fonts','browserSync'], function(){
	gulp.watch(config.src + config.css.watch, ['styles', browserSync.reload]);
	gulp.watch(config.src + config.js.src, ['scripts', browserSync.reload])
	gulp.watch(config.src + config.html, browserSync.reload);
	gulp.watch(config.src + config.img.src, ['img-compress']);
})
/////////////////////

gulp.task('build', ['styles', 'scripts', 'img-compress', 'del-release'],function(){
	var styles 	= gulp.src(config.src + config.css.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.styles));
	var scripts = gulp.src(config.src + config.js.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.scripts));
	var images 	= gulp.src(config.src + config.img.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.images))
	var html 	= gulp.src(config.src + '/*.html')
					.pipe(gulp.dest(config.release.current));
	var fonts	= gulp.src(config.src + config.font.src + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.fonts))
})

gulp.task('del-release', function() {
	return del.sync(['!' + config.release.assets + '/components', config.release.assets]);
});


gulp.task('default', ['watch']);