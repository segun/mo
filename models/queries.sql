CREATE TABLE masep.questions (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	question varchar(500) NOT NULL ,
	answer varchar(255) NOT NULL,	
	image_url varchar(255) NULL,
	CONSTRAINT questions_pk PRIMARY KEY (id),
	CONSTRAINT questions_un UNIQUE (question)
);

ALTER TABLE masep.questions ADD option_a varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_b varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_c varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_d varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_e varchar(500) NOT NULL;


CREATE TABLE masep.user_answers (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	email varchar(255) NULL,
	question_id bigint NOT NULL,
	answer varchar(500) NOT NULL DEFAULT false,
	is_correct boolean NOT NULL,
	CONSTRAINT user_answers_pk PRIMARY KEY (id),
	CONSTRAINT user_answers_fk FOREIGN KEY (id) REFERENCES masep.questions(id)
);

CREATE INDEX user_answers_is_correct_idx ON masep.user_answers (is_correct,answer,question_id,email);
