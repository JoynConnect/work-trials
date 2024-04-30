import logging


def setup_logger(logger):
    FORMAT = '%(levelname)s - %(asctime)s %(filename)s - %(funcName)s L%(lineno)d: %(message)s'
    logging.basicConfig(level=logging.DEBUG)
    logger.setLevel(logging.DEBUG)
    logger.propagate = False
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(FORMAT)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger
